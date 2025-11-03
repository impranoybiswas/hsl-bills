import { getCustomersCollection } from "@/app/libs/collection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");

    // Build dynamic MongoDB query
    const query: Record<string, string> = {};
    if (name) query.name = name;
    // Connect to MongoDB
    const collection = await getCustomersCollection();

    // If query is empty → MongoDB will automatically return all documents
    const result = await collection.find(query).toArray();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
