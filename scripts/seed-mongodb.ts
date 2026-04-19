/**
 * MongoDB Seed Script
 * Run with: npx ts-node scripts/seed-mongodb.ts
 * Or via npm: npm run seed:mongo
 * 
 * This script seeds the MongoDB database with sample users and transactions.
 * It skips seeding in production to avoid overwriting live data.
 */

import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("❌ MONGODB_URI environment variable is not set")
  process.exit(1)
}

const client = new MongoClient(uri)

async function seed() {
  // Skip seeding in production
  if (process.env.NODE_ENV === "production") {
    console.log("🚫 Skipping seeding in production environment")
    return
  }

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("mybank")

    // Clear existing collections
    console.log("🗑️  Clearing existing data...")
    await db.collection("users").deleteMany({})
    await db.collection("accounts").deleteMany({})
    await db.collection("transactions").deleteMany({})

    // Insert sample users with roles
    console.log("Creating sample users...")
    const users = [
      {
        username: "ben",
        password: bcrypt.hashSync("1234", 10),
        email: "ben@example.com",
        role: "admin", // Admin user
        createdAt: new Date(),
      },
      {
        username: "alice",
        password: bcrypt.hashSync("5678", 10),
        email: "alice@example.com",
        role: "user", // Regular user
        createdAt: new Date(),
      },
      {
        username: "demo",
        password: bcrypt.hashSync("demo123", 10),
        email: "demo@example.com",
        role: "user", // Regular user
        createdAt: new Date(),
      },
    ]
    await db.collection("users").insertMany(users)

    // Insert accounts
    console.log("💳 Creating accounts...")
    const accounts = [
      {
        userId: "ben",
        balance: 5000,
        accountNumber: "1234567890",
        createdAt: new Date(),
      },
      {
        userId: "alice",
        balance: 3000,
        accountNumber: "9876543210",
        createdAt: new Date(),
      },
      {
        userId: "demo",
        balance: 10000,
        accountNumber: "5555555555",
        createdAt: new Date(),
      },
    ]
    await db.collection("accounts").insertMany(accounts)

    // Insert sample transactions
    console.log("📝 Creating sample transactions...")
    const now = new Date()
    const transactions = [
      {
        fromUserId: "system",
        toUserId: "ben",
        amount: 5000,
        type: "deposit",
        description: "Initial deposit",
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        fromUserId: "system",
        toUserId: "alice",
        amount: 3000,
        type: "deposit",
        description: "Initial deposit",
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        fromUserId: "system",
        toUserId: "demo",
        amount: 10000,
        type: "deposit",
        description: "Demo account setup",
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        fromUserId: "ben",
        toUserId: "alice",
        amount: 200,
        type: "transfer",
        description: "Payment for lunch",
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        fromUserId: "alice",
        toUserId: "ben",
        amount: 150,
        type: "transfer",
        description: "Splitting groceries",
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        fromUserId: "demo",
        toUserId: "alice",
        amount: 500,
        type: "transfer",
        description: "Test transfer",
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
    await db.collection("transactions").insertMany(transactions)

    // Create indexes for better query performance
    console.log("📊 Creating indexes...")
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("accounts").createIndex({ userId: 1 }, { unique: true })
    await db.collection("accounts").createIndex({ accountNumber: 1 }, { unique: true })
    await db.collection("transactions").createIndex({ fromUserId: 1, date: -1 })
    await db.collection("transactions").createIndex({ toUserId: 1, date: -1 })

    console.log("Database seeded successfully!")
    console.log("")
    console.log("Test Accounts:")
    console.log("   Username: ben    | Password: 1234    | Balance: $5,000 | Role: ADMIN")
    console.log("   Username: alice  | Password: 5678    | Balance: $3,000 | Role: user")
    console.log("   Username: demo   | Password: demo123 | Balance: $10,000 | Role: user")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("🔌 Disconnected from MongoDB")
  }
}

seed()
