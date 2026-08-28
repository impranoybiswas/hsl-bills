import { NextRequest, NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/libs/googleSheet";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");

    let customers = await getCustomers();

    if (name) {
      customers = customers.filter((c) =>
        c.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, price, isMonthly, product, customerId } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name and price" },
        { status: 400 },
      );
    }

    const res = await createCustomer({
      customerId: customerId || Date.now().toString(),
      name,
      address: address || "",
      price: parseFloat(price) || 0,
      isMonthly: !!isMonthly,
      product: product || "",
    });

    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Customer created" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updatedData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    const res = await updateCustomer(id, updatedData);

    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Customer updated" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 },
      );
    }

    const res = await deleteCustomer(id);

    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Customer deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
