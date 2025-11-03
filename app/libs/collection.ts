import { getCollection } from "@/app/libs/connectDB";

export async function getUsersCollection() {
  const collection = await getCollection("users");
  if (!collection) {
    throw new Error("Failed to connect to collection");
  }
  return collection;
}

export async function getCustomersCollection() {
  const collection = await getCollection("customers");
  if (!collection) {
    throw new Error("Failed to connect to collection");
  }
  return collection;
}

export async function getBillsCollection() {
  const collection = await getCollection("bills");
  if (!collection) {
    throw new Error("Failed to connect to collection");
  }
  return collection;
}
