import { getBillsCollection } from "@/app/libs/collection";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// =======================
// GET → Fetch Bills
// =======================

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const customer = searchParams.get("customer");
    const status = searchParams.get("status");
    const sortOrder = searchParams.get("sortOrder");

    const query: Record<string, string> = {};
    if (customer) query.customer = customer;
    if (status) query.status = status;

    const collection = await getBillsCollection();

    // ✅ Determine sort direction safely
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    const result = await collection
      .find(query)
      .sort({ date: sortDirection }) // ✅ cleaner key reference
      .toArray();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}


// =======================
// POST → Add a New Bill
// =======================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, quantity, amount, date } = body;

    // Basic validation
    if (!customer || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const collection = await getBillsCollection();

    // Fetch the latest bill to determine the next invoice number
    const lastBill = await collection
      .find({})
      .sort({ invoice: -1 })
      .limit(1)
      .toArray();

    // Determine next invoice number
    const nextInvoice =
      lastBill.length > 0 ? String(Number(lastBill[0].invoice) + 1) : "1001"; // starting from 1001 if none exists

    // Prepare new bill data
    const newBill = {
      invoice: nextInvoice,
      date: date || new Date().toISOString(),
      customer,
      quantity,
      amount,
      status: "pending",
      method: null,
      paidAt: null,
    };

    // Insert into MongoDB
    const result = await collection.insertOne(newBill);

    return NextResponse.json(
      { insertedId: result.insertedId, ...newBill },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/bills error:", error);
    return NextResponse.json({ error: "Failed to add bill" }, { status: 500 });
  }
}

// =======================
// PATCH → Update Bill Status
// =======================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, method, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Bill ID and new status are required" },
        { status: 400 }
      );
    }

    const collection = await getBillsCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          method,
          status,
          paidAt: status === "paid" ? new Date().toISOString() : null,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Bill status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/bills error:", error);
    return NextResponse.json(
      { error: "Failed to update bill status" },
      { status: 500 }
    );
  }
}
