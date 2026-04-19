import { MongoClient, Db, Document } from "mongodb"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {})
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, {})
      clientPromise = client.connect()
    }
    return clientPromise
  }
}

// Export a lazy-loading module promise
export default function getConnection(): Promise<MongoClient> {
  return getClientPromise()
}

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
