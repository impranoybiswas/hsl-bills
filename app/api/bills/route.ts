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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: Record<string, string> = {};
    if (customer) query.customer = customer;
    if (status) query.status = status;

    const collection = await getBillsCollection();

    // ✅ Determine sort direction safely
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    // Aggregation for global stats based on filter
    const statsPipeline: object[] = [{ $match: query }];
    statsPipeline.push({
      $group: {
        _id: null,
        totalAmount: { $sum: { $toDouble: "$amount" } },
        totalPaid: {
          $sum: {
            $cond: [{ $eq: ["$status", "paid"] }, { $toDouble: "$amount" }, 0],
          },
        },
        totalPending: {
          $sum: {
            $cond: [
              { $eq: ["$status", "pending"] },
              { $toDouble: "$amount" },
              0,
            ],
          },
        },
        totalCount: { $sum: 1 },
      },
    });

    const [bills, total, statsResult] = await Promise.all([
      collection
        .find(query)
        .sort({ date: sortDirection })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
      collection.aggregate(statsPipeline).toArray(),
    ]);

    const stats = statsResult[0] || {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalCount: 0,
    };

    return NextResponse.json({ bills, total, stats }, { status: 200 });
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    const collection = await getBillsCollection();

    // Fetch the latest bills to determine the next invoice number
    // We fetch a few to ensure we can find the numeric maximum in case of inconsistent sorting
    const bills = await collection
      .find({})
      .sort({ _id: -1 })
      .limit(20)
      .toArray();

    // Determine next invoice number by finding the max numeric value
    let nextInvoiceValue = 1001;
    if (bills.length > 0) {
      const invoiceNumbers = bills
        .map((b) => Number(b.invoice))
        .filter((n) => !isNaN(n));
      if (invoiceNumbers.length > 0) {
        nextInvoiceValue = Math.max(...invoiceNumbers) + 1;
      }
    }
    const nextInvoice = String(nextInvoiceValue);

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
      { status: 201 },
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
        { status: 400 },
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
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Bill status updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/bills error:", error);
    return NextResponse.json(
      { error: "Failed to update bill status" },
      { status: 500 },
    );
  }
}
