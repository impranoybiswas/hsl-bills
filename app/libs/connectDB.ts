import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const databaseName = process.env.DATABASE_NAME || "";

if (!uri) {
  throw new Error("MongoDB URI not found");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB(dbName: string) {
  try {
    await client.connect();
    console.log(">>>>>Connected to MongoDB<<<<<");
    return client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export async function getCollection(collectionName: string) {
  const db = await connectDB(databaseName);
  if (db) return db.collection(collectionName);
  return null;
}
