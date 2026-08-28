"use server";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  message: string;
  error?: string;
  id?: string;
};

function generateId() {
  return [...crypto.getRandomValues(new Uint8Array(12))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper: robustly interpret many possible truthy representations that a
 * Google Sheet cell can contain for a boolean column (e.g. "true", "TRUE",
 * "1", 1, true, "yes"). Sheets imported from Excel/Mongo exports often store
 * booleans as 0/1 numbers rather than the literal string "true".
 */
function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return false;
}

/**
 * Helper function to initialize and authenticate with the Google Sheet
 */
async function getGoogleSheet(sheetTitle: string, defaultHeaders: string[]) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      serviceAccountAuth,
    );
    await doc.loadInfo();

    // Match tab names case-insensitively (and ignoring stray whitespace),
    // since Google Sheets tab names are case-sensitive but sheets created
    // by hand (or imported from Excel/Mongo exports) may use different
    // casing than the app expects (e.g. "bills" vs "Bills").
    const target = sheetTitle.trim().toLowerCase();
    let sheet = Object.values(doc.sheetsByTitle).find(
      (s) => s.title.trim().toLowerCase() === target,
    );

    if (!sheet) {
      // Only create a brand-new sheet if one truly doesn't exist under any
      // casing. We never repurpose/rename an unrelated existing sheet.
      sheet = await doc.addSheet({
        title: sheetTitle,
        headerValues: defaultHeaders,
      });
    }

    try {
      await sheet.loadHeaderRow();
    } catch (e) {
      await sheet.setHeaderRow(defaultHeaders);
    }

    return sheet;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Google Sheet Connection Error:", message);
    throw new Error("Failed to connect to Google Sheets");
  }
}

// ----------------- USERS -----------------

export async function createUser(user: {
  name: string;
  email: string;
  image?: string;
  role?: string;
}): Promise<ActionResponse> {
  try {
    if (!user.name || !user.email) {
      return { success: false, message: "Name and email are required." };
    }
    const sheet = await getGoogleSheet("Users", [
      "_id",
      "name",
      "email",
      "provider",
      "image",
      "role",
      "createdAt",
      "lastSignInAt",
    ]);

    await sheet.addRow({
      _id: generateId(),
      name: user.name,
      email: user.email,
      provider: "google",
      role: user.role || "viewer",
      image: user.image || "",
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
    });

    revalidatePath("/");
    return { success: true, message: "Successfully added to Google Sheet!" };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to add data.",
      error: errorMessage,
    };
  }
}

const USER_HEADERS = [
  "_id",
  "name",
  "email",
  "provider",
  "image",
  "role",
  "createdAt",
  "lastSignInAt",
];

export async function getUsers() {
  try {
    const sheet = await getGoogleSheet("Users", USER_HEADERS);
    const rows = await sheet.getRows();

    return rows.map((row) => ({
      id: row.get("_id") || "",
      name: row.get("name") || "",
      email: row.get("email") || "",
      role: row.get("role") || "viewer",
      image: row.get("image") || "",
    }));
  } catch (error: unknown) {
    return [];
  }
}

export async function getUserByEmail(email: string) {
  try {
    const sheet = await getGoogleSheet("Users", USER_HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(
      (row) =>
        (row.get("email") || "").toString().trim().toLowerCase() ===
        email.trim().toLowerCase(),
    );
    if (!row) return null;

    // Keep lastSignInAt fresh without blocking the caller.
    row.set("lastSignInAt", new Date().toISOString());
    row.save().catch(() => {});

    return {
      id: row.get("_id") || "",
      name: row.get("name") || "",
      email: row.get("email") || "",
      role: (row.get("role") || "viewer").toString().trim().toLowerCase(),
      image: row.get("image") || "",
    };
  } catch (error) {
    return null;
  }
}
export async function updateUser(updatedUser: {
  id: string;
  name: string;
  email: string;
  role?: string;
}): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Users", USER_HEADERS);
    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("_id") === updatedUser.id);

    if (!targetRow) return { success: false, message: "Record not found." };
    targetRow.set("name", updatedUser.name);
    targetRow.set("email", updatedUser.email);
    if (updatedUser.role) targetRow.set("role", updatedUser.role);
    await targetRow.save();

    revalidatePath("/");
    return { success: true, message: "Successfully updated the record!" };
  } catch (error: unknown) {
    return { success: false, message: "Failed to update record." };
  }
}

export async function deleteUser(id: string): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Users", USER_HEADERS);
    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("_id") === id);

    if (!targetRow) return { success: false, message: "Record not found." };
    await targetRow.delete();

    revalidatePath("/");
    return { success: true, message: "Successfully removed!" };
  } catch (error: unknown) {
    return { success: false, message: "Failed to delete record." };
  }
}

// ----------------- BILLS -----------------

export async function createBill(
  bill: Omit<Bill, "_id">,
): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Bills", [
      "_id",
      "invoice",
      "customer",
      "quantity",
      "amount",
      "status",
      "date",
      "method",
      "paidAt",
    ]);

    const newId = generateId();
    await sheet.addRow({
      _id: newId,
      invoice: bill.invoice,
      customer: bill.customer.toLowerCase(),
      quantity: bill.quantity.toString(),
      amount: bill.amount.toString(),
      status: bill.status || "pending",
      date: bill.date,
      method: bill.method || "",
      paidAt: bill.paidAt ? new Date(bill.paidAt).toISOString() : "",
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Successfully added bill to Google Sheet!",
      id: newId,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Create Bill Error:", errorMessage);
    return {
      success: false,
      message: "Failed to add bill.",
      error: errorMessage,
    };
  }
}

export async function getBills(): Promise<Bill[]> {
  try {
    const sheet = await getGoogleSheet("Bills", [
      "_id",
      "invoice",
      "customer",
      "quantity",
      "amount",
      "status",
      "date",
      "method",
      "paidAt",
    ]);
    const rows = await sheet.getRows();

    return rows.map((row) => ({
      _id: row.get("_id") || "",
      invoice: row.get("invoice") || "",
      customer: row.get("customer") || "",
      quantity: row.get("quantity") || 0,
      amount: parseFloat(row.get("amount") || "0"),
      status: (row.get("status") || "").toString().toLowerCase(),
      date: row.get("date") || "",
      method: row.get("method") || "",
      paidAt: row.get("paidAt") || undefined,
    }));
  } catch (error: unknown) {
    console.error("Get Bills Error:", error);
    return [];
  }
}

export async function updateBill(
  id: string,
  updatedData: Partial<Bill>,
): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Bills", [
      "_id",
      "invoice",
      "customer",
      "quantity",
      "amount",
      "status",
      "date",
      "method",
      "paidAt",
    ]);
    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("_id") === id);

    if (!targetRow) return { success: false, message: "Bill not found." };

    if (updatedData.status) targetRow.set("status", updatedData.status);
    if (updatedData.method !== undefined)
      targetRow.set("method", updatedData.method || "");
    if (updatedData.paidAt)
      targetRow.set("paidAt", updatedData.paidAt.toString());

    await targetRow.save();

    revalidatePath("/");
    return { success: true, message: "Successfully updated the bill!" };
  } catch (error: unknown) {
    return { success: false, message: "Failed to update bill." };
  }
}

export async function deleteBill(id: string): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Bills", [
      "_id",
      "invoice",
      "customer",
      "quantity",
      "amount",
      "status",
      "date",
      "method",
      "paidAt",
    ]);
    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("_id") === id);

    if (!targetRow) return { success: false, message: "Bill not found." };
    await targetRow.delete();

    revalidatePath("/");
    return { success: true, message: "Successfully removed bill!" };
  } catch (error: unknown) {
    return { success: false, message: "Failed to delete bill." };
  }
}

// ----------------- CUSTOMERS -----------------

export async function createCustomer(
  customer: Omit<Customer, "_id">,
): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Customers", [
      "_id",
      "customerId",
      "name",
      "address",
      "price",
      "isMonthly",
      "product",
    ]);

    await sheet.addRow({
      _id: generateId(),
      customerId: customer.customerId || "",
      name: customer.name,
      address: customer.address || "",
      price: customer.price.toString(),
      isMonthly: customer.isMonthly ? "true" : "false",
      product: customer.product || "",
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Successfully added customer to Google Sheet!",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Create Customer Error:", errorMessage);
    return {
      success: false,
      message: "Failed to add customer.",
      error: errorMessage,
    };
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const sheet = await getGoogleSheet("Customers", [
      "_id",
      "customerId",
      "name",
      "address",
      "price",
      "isMonthly",
      "product",
    ]);
    const rows = await sheet.getRows();

    return rows.map((row) => ({
      _id: row.get("_id") || "",
      customerId: row.get("customerId") || "",
      name: row.get("name") || "",
      address: row.get("address") || "",
      price: parseFloat(row.get("price") || "0"),
      isMonthly: toBool(row.get("isMonthly")),
      product: row.get("product") || "",
    }));
  } catch (error: unknown) {
    console.error("Get Customers Error:", error);
    return [];
  }
}

export async function updateCustomer(
  id: string,
  updatedData: Partial<Customer>,
): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Customers", [
      "_id",
      "customerId",
      "name",
      "address",
      "price",
      "isMonthly",
      "product",
    ]);
    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("_id") === id);

    if (!targetRow) return { success: false, message: "Customer not found." };

    if (updatedData.name !== undefined) targetRow.set("name", updatedData.name);
    if (updatedData.address !== undefined)
      targetRow.set("address", updatedData.address);
    if (updatedData.price !== undefined)
      targetRow.set("price", updatedData.price.toString());
    if (updatedData.isMonthly !== undefined)
      targetRow.set("isMonthly", updatedData.isMonthly ? "true" : "false");
    if (updatedData.product !== undefined)
      targetRow.set("product", updatedData.product);
    if (updatedData.customerId !== undefined)
      targetRow.set("customerId", updatedData.customerId);

    await targetRow.save();

    revalidatePath("/");
    return { success: true, message: "Successfully updated the customer!" };
  } catch (error: unknown) {
    return { success: false, message: "Failed to update customer." };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResponse> {
  try {
    const sheet = await getGoogleSheet("Customers", [
      "_id",
      "customerId",
      "name",
      "address",
      "price",
      "isMonthly",
      "product",
    ]);
    const rows = await sheet.getRows();
    const targetRow = rows.find((row) => row.get("_id") === id);

    if (!targetRow) return { success: false, message: "Customer not found." };
    await targetRow.delete();

    revalidatePath("/");
    return { success: true, message: "Successfully removed customer!" };
  } catch (error: unknown) {
    return { success: false, message: "Failed to delete customer." };
  }
}
