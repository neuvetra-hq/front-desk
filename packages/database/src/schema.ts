import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  twilioNumber: text("twilio_number").notNull().unique(),
  ownerPhone: text("owner_phone").notNull(),
  aiTemplate: jsonb("ai_template"),
  calcomApiKey: text("calcom_api_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const calls = pgTable("calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  callerNumber: text("caller_number").notNull(),
  status: text("status", { enum: ["in_progress", "completed", "missed"] })
    .notNull()
    .default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  transcript: text("transcript"),
  recordingUrl: text("recording_url"),
})
