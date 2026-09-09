import { NextRequest, NextResponse } from "next/server";
import { getBills, createBill, updateBill } from "@/app/libs/googleSheet";

// =======================
// GET → Fetch Bills
// =======================

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const customer = searchParams.get("customer");
    const status = searchParams.get("status");
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const allBills = await getBills();

    // Filter by customer first (case-insensitive and trimmed)
    let customerFiltered = [...allBills];
    if (customer) {
      const normalizedCustomer = customer.trim().toLowerCase();
      customerFiltered = customerFiltered.filter(
        (b) => (b.customer || "").trim().toLowerCase() === normalizedCustomer,
      );
    }

    // Compute stats based on the customer-filtered dataset
    const totalCount = customerFiltered.length;
    const totalPaid = customerFiltered
      .filter((b) => (b.status || "").toLowerCase() === "paid")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalPending = customerFiltered
      .filter((b) => (b.status || "").toLowerCase() === "pending")
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Filter by status for table display
    let filtered = [...customerFiltered];
    if (status) {
      const normalizedStatus = status.trim().toLowerCase();
      filtered = filtered.filter(
        (b) => (b.status || "").trim().toLowerCase() === normalizedStatus,
      );
    }

    // Sort
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return (dateA - dateB) * sortDirection;
    });

    // Pagination (on filtered set)
    const startIndex = (page - 1) * limit;
    const paginatedBills = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        bills: paginatedBills,
        pagination: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        },
        stats: {
          totalPaid,
          totalPending,
          totalCount,
        },
      },
      { status: 200 },
    );
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

    if (!customer || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Fetch existing for next invoice number
    const allBills = await getBills();
    let maxInvoice = 1000;
    for (const b of allBills) {
      const invNum = parseInt(b.invoice);
      if (!isNaN(invNum) && invNum > maxInvoice) {
        maxInvoice = invNum;
      }
    }
    const nextInvoice = (maxInvoice + 1).toString();

    const newBill = {
      invoice: nextInvoice,
      date: date || new Date().toISOString(),
      customer,
      quantity,
      amount: parseFloat(amount) || 0,
    };

    const res = await createBill(newBill);
    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Bill created successfully",
        invoice: nextInvoice,
        _id: res.id,
      },
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

    const res = await updateBill(id, {
      status,
      method: method || "",
      paidAt: status === "paid" ? new Date().toISOString() : undefined,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 404 });
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
