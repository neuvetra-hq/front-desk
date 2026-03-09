import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const businessStatusEnum = pgEnum("business_status", [
  "active",
  "inactive",
  "suspended",
])

export const businessTypeEnum = pgEnum("business_type", [
  "medical",
  "dental",
  "spa",
  "salon",
  "plumbing",
  "legal",
  "real_estate",
  "other",
])

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "member",
])

export const callStatusEnum = pgEnum("call_status", [
  "in_progress",
  "completed",
  "missed",
  "transferred",
])

// ---------------------------------------------------------------------------
// businesses
// ---------------------------------------------------------------------------

export const businesses = pgTable("businesses", {
  id:            uuid("id").primaryKey().defaultRandom(),
  name:          text("name").notNull(),
  slug:          text("slug").notNull().unique(),
  twilioNumber:    text("twilio_number").unique(),
  twilioNumberSid: text("twilio_number_sid").unique(),
  aiConfig:      jsonb("ai_config"),
  calcomApiKey:  text("calcom_api_key"),
  status:        businessStatusEnum("status").notNull().default("active"),
  businessType:  businessTypeEnum("business_type"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// users  (id mirrors Supabase auth.users.id — no defaultRandom())
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id:        uuid("id").primaryKey(),
  email:     text("email").notNull().unique(),
  fullName:  text("full_name"),
  phone:     text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// business_members  (many-to-many: users ↔ businesses)
// ---------------------------------------------------------------------------

export const businessMembers = pgTable(
  "business_members",
  {
    id:         uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    userId:     uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role:       memberRoleEnum("role").notNull().default("member"),
    createdAt:  timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("uq_business_members").on(t.businessId, t.userId)],
)

// ---------------------------------------------------------------------------
// knowledge_base
// ---------------------------------------------------------------------------

export const knowledgeBase = pgTable("knowledge_base", {
  id:         uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  question:   text("question").notNull(),
  answer:     text("answer").notNull(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// calls
// ---------------------------------------------------------------------------

export const calls = pgTable("calls", {
  id:              uuid("id").primaryKey().defaultRandom(),
  businessId:      uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  callerNumber:    text("caller_number").notNull(),
  status:          callStatusEnum("status").notNull().default("in_progress"),
  summary:         text("summary"),
  durationSeconds: integer("duration_seconds"),
  retellCallId:    text("retell_call_id").unique(),
  transcript:      text("transcript"),
  recordingUrl:    text("recording_url"),
  startedAt:       timestamp("started_at").notNull().defaultNow(),
  endedAt:         timestamp("ended_at"),
})
