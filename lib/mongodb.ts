import { MongoClient, Db, Document, MongoClientOptions } from "mongodb"
import { attachDatabasePool } from "@vercel/functions"

const uri = process.env.MONGODB_URI

if (!uri) {
  console.warn("MONGODB_URI environment variable is not set - MongoDB features will be disabled")
}

const options: MongoClientOptions = {
  appName: "mybank.vercel.integration",
  maxIdleTimeMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 1,
}

// Create a single client instance
const client = uri ? new MongoClient(uri, options) : null

// Attach the client to ensure proper cleanup on function suspension (Vercel serverless)
if (client) {
  attachDatabasePool(client)
}

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (!client) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  } else {
    if (!clientPromise) {
      clientPromise = client.connect()
    }
    return clientPromise
  }
}

// Export a lazy-loading module promise
export default function getConnection(): Promise<MongoClient> {
  return getClientPromise()
}

// Export the client directly for cases where attachDatabasePool pattern is preferred
export { client }

// Helper to get the database directly
export async function getDatabase(dbName: string = "mybank"): Promise<Db> {
  const mongoClient = await getClientPromise()
  return mongoClient.db(dbName)
}

// Helper to get a collection directly
export async function getCollection<T extends Document>(
  collectionName: string,
  dbName: string = "mybank"
) {
  const db = await getDatabase(dbName)
  return db.collection<T>(collectionName)
}

// Check if MongoDB is configured
export function isMongoConfigured(): boolean {
  return !!uri && !!client
}
