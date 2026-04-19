import { MongoClient, Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
// In production, it's best to not use a global variable.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise
export default clientPromise

// Helper to get the database directly
export async function getDatabase(dbName: string = "mybank"): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

// Helper to get a collection directly
export async function getCollection<T extends Document>(
  collectionName: string,
  dbName: string = "mybank"
) {
  const db = await getDatabase(dbName)
  return db.collection<T>(collectionName)
}
