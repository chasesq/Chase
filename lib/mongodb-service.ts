import { getDatabase, getCollection } from "./mongodb"
import { ObjectId } from "mongodb"

// ============================================
// MongoDB Service Layer
// Use MongoDB for: analytics, logs, notifications, chat, audit trails
// Use Neon (PostgreSQL) for: users, accounts, transactions, sessions
// ============================================

// Types for MongoDB collections
export interface ActivityLog {
  _id?: ObjectId
  userId: string
  action: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export interface Notification {
  _id?: ObjectId
  userId: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  read: boolean
  createdAt: Date
  readAt?: Date
}

export interface AnalyticsEvent {
  _id?: ObjectId
  eventName: string
  userId?: string
  sessionId?: string
  properties: Record<string, any>
  timestamp: Date
}

export interface ChatMessage {
  _id?: ObjectId
  conversationId: string
  userId: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

// ============================================
// Activity Logs - Track user actions for audit
// ============================================

export async function logActivity(log: Omit<ActivityLog, "_id" | "timestamp">) {
  const collection = await getCollection<ActivityLog>("activity_logs")
  const result = await collection.insertOne({
    ...log,
    timestamp: new Date(),
  })
  return result.insertedId
}

export async function getActivityLogs(userId: string, limit = 50) {
  const collection = await getCollection<ActivityLog>("activity_logs")
  return collection
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
}

export async function getRecentActivity(limit = 100) {
  const collection = await getCollection<ActivityLog>("activity_logs")
  return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray()
}

// ============================================
// Notifications - User notification system
// ============================================

export async function createNotification(
  notification: Omit<Notification, "_id" | "createdAt" | "read">
) {
  const collection = await getCollection<Notification>("notifications")
  const result = await collection.insertOne({
    ...notification,
    read: false,
    createdAt: new Date(),
  })
  return result.insertedId
}

export async function getUserNotifications(userId: string, limit = 20) {
  const collection = await getCollection<Notification>("notifications")
  return collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function getUnreadNotificationCount(userId: string) {
  const collection = await getCollection<Notification>("notifications")
  return collection.countDocuments({ userId, read: false })
}

export async function markNotificationAsRead(notificationId: string) {
  const collection = await getCollection<Notification>("notifications")
  return collection.updateOne(
    { _id: new ObjectId(notificationId) },
    { $set: { read: true, readAt: new Date() } }
  )
}

export async function markAllNotificationsAsRead(userId: string) {
  const collection = await getCollection<Notification>("notifications")
  return collection.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  )
}

// ============================================
// Analytics Events - Track usage and behavior
// ============================================

export async function trackEvent(
  event: Omit<AnalyticsEvent, "_id" | "timestamp">
) {
  const collection = await getCollection<AnalyticsEvent>("analytics_events")
  const result = await collection.insertOne({
    ...event,
    timestamp: new Date(),
  })
  return result.insertedId
}

export async function getEventsByName(eventName: string, limit = 100) {
  const collection = await getCollection<AnalyticsEvent>("analytics_events")
  return collection
    .find({ eventName })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
}

export async function getUserEvents(userId: string, limit = 50) {
  const collection = await getCollection<AnalyticsEvent>("analytics_events")
  return collection
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
}

export async function getEventStats(eventName: string, days = 7) {
  const collection = await getCollection<AnalyticsEvent>("analytics_events")
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return collection
    .aggregate([
      {
        $match: {
          eventName,
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray()
}

// ============================================
// Chat Messages - Support chat / AI assistant
// ============================================

export async function saveMessage(message: Omit<ChatMessage, "_id" | "timestamp">) {
  const collection = await getCollection<ChatMessage>("chat_messages")
  const result = await collection.insertOne({
    ...message,
    timestamp: new Date(),
  })
  return result.insertedId
}

export async function getConversation(conversationId: string) {
  const collection = await getCollection<ChatMessage>("chat_messages")
  return collection
    .find({ conversationId })
    .sort({ timestamp: 1 })
    .toArray()
}

export async function getUserConversations(userId: string) {
  const collection = await getCollection<ChatMessage>("chat_messages")
  return collection
    .aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $last: "$content" },
          lastTimestamp: { $last: "$timestamp" },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ])
    .toArray()
}

// ============================================
// Utility Functions
// ============================================

export async function createIndexes() {
  const db = await getDatabase()

  // Activity logs indexes
  await db
    .collection("activity_logs")
    .createIndex({ userId: 1, timestamp: -1 })
  await db.collection("activity_logs").createIndex({ timestamp: -1 })

  // Notifications indexes
  await db
    .collection("notifications")
    .createIndex({ userId: 1, createdAt: -1 })
  await db.collection("notifications").createIndex({ userId: 1, read: 1 })

  // Analytics events indexes
  await db
    .collection("analytics_events")
    .createIndex({ eventName: 1, timestamp: -1 })
  await db
    .collection("analytics_events")
    .createIndex({ userId: 1, timestamp: -1 })

  // Chat messages indexes
  await db
    .collection("chat_messages")
    .createIndex({ conversationId: 1, timestamp: 1 })
  await db.collection("chat_messages").createIndex({ userId: 1 })

  console.log("MongoDB indexes created successfully")
}
