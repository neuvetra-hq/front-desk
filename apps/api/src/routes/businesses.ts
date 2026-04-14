import { Elysia, t } from "elysia"
import { db, businesses, businessMembers, calls, knowledgeBase, callbackRequests } from "@frontdesk/database"
import { eq, desc, gte, sql, asc, and } from "drizzle-orm"
import { searchAvailableNumbers, provisionNumber, releaseNumber } from "../services/twilio"
import { KB_TEMPLATES } from "../data/kb-templates"

export const businessesRoutes = new Elysia({ prefix: "/businesses" })

  // Create a new business and link it to a user (owner)
  .post("/", async ({ body }) => {
    const { name, businessType, userId } = body as {
      name: string
      businessType: string
      userId: string
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const defaultBusinessHours = {
      Monday:    { open: true,  from: "09:00", to: "17:00" },
      Tuesday:   { open: true,  from: "09:00", to: "17:00" },
      Wednesday: { open: true,  from: "09:00", to: "17:00" },
      Thursday:  { open: true,  from: "09:00", to: "17:00" },
      Friday:    { open: true,  from: "09:00", to: "17:00" },
      Saturday:  { open: false, from: "09:00", to: "14:00" },
      Sunday:    { open: false, from: "09:00", to: "14:00" },
    }

    const [business] = await db
      .insert(businesses)
      .values({
        name,
        slug,
        businessType: businessType as typeof businesses.$inferInsert["businessType"],
        status: "inactive",
        aiConfig: { businessHours: defaultBusinessHours },
      })
      .returning()

    await db.insert(businessMembers).values({
      businessId: business.id,
      userId,
      role: "owner",
    })

    // Seed default knowledge base for this business type
    const template = KB_TEMPLATES[businessType]
    if (template && template.length > 0) {
      await db.insert(knowledgeBase).values(
        template.map((entry) => ({
          businessId: business.id,
          question:   entry.question,
          answer:     entry.answer,
          category:   entry.category,
          sortOrder:  entry.sortOrder,
        }))
      )
    }

    return { businessId: business.id }
  }, {
    body: t.Object({
      name: t.String(),
      businessType: t.Union([
        t.Literal("medical"), t.Literal("dental"), t.Literal("spa"),
        t.Literal("salon"), t.Literal("plumbing"), t.Literal("legal"),
        t.Literal("real_estate"), t.Literal("other"),
      ]),
      userId: t.String(),
    }),
  })

  // Update business details — accepts any subset of fields
  .patch("/:id", async ({ params, body }) => {
    const { id } = params
    const { name, businessType, areaCode, aiConfig: aiConfigPatch } = body as {
      name?: string
      businessType?: string
      areaCode?: string
      aiConfig?: Record<string, unknown>
    }

    const [existing] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1)

    if (!existing) return { error: "Business not found" }

    const existingConfig = (existing.aiConfig as Record<string, unknown>) ?? {}
    const mergedConfig = {
      ...existingConfig,
      ...(areaCode ? { preferredAreaCode: areaCode } : {}),
      ...(aiConfigPatch ?? {}),
    }

    await db
      .update(businesses)
      .set({
        ...(name ? { name } : {}),
        ...(businessType ? { businessType: businessType as typeof businesses.$inferInsert["businessType"] } : {}),
        aiConfig: mergedConfig,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))

    return { updated: true }
  }, {
    body: t.Object({
      name:         t.Optional(t.String()),
      businessType: t.Optional(t.Union([
        t.Literal("medical"), t.Literal("dental"), t.Literal("spa"),
        t.Literal("salon"), t.Literal("plumbing"), t.Literal("legal"),
        t.Literal("real_estate"), t.Literal("other"),
      ])),
      areaCode:  t.Optional(t.String()),
      aiConfig:  t.Optional(t.Record(t.String(), t.Unknown())),
    }),
  })

  // Search available Twilio numbers by area code
  .get("/:id/available-numbers", async ({ params, query }) => {
    const areaCode = (query as Record<string, string>).areaCode ?? "415"
    const numbers = await searchAvailableNumbers(areaCode)
    return { numbers }
  })

  // Purchase a Twilio number and assign it to this business
  .post("/:id/provision", async ({ params, body }) => {
    const { id } = params
    const { phoneNumber } = body as { phoneNumber: string }

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1)

    if (!business) return { error: "Business not found" }
    if (business.twilioNumber) return { error: "Business already has a number assigned" }

    const purchased = await provisionNumber(phoneNumber)

    await db
      .update(businesses)
      .set({
        twilioNumber: purchased.phoneNumber,
        twilioNumberSid: purchased.sid,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))

    console.log(`✅ Provisioned ${purchased.phoneNumber} (${purchased.sid}) for business ${id}`)

    return {
      phoneNumber: purchased.phoneNumber,
      sid: purchased.sid,
    }
  }, {
    body: t.Object({ phoneNumber: t.String() }),
  })

  // Release the Twilio number and deactivate the business
  .post("/:id/release", async ({ params }) => {
    const { id } = params

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1)

    if (!business) return { error: "Business not found" }
    if (!business.twilioNumberSid) return { error: "No Twilio number assigned" }

    await releaseNumber(business.twilioNumberSid)

    await db
      .update(businesses)
      .set({
        twilioNumber: null,
        twilioNumberSid: null,
        status: "inactive",
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))

    console.log(`🗑️  Released number for business ${id}`)

    return { released: true }
  })

  // GET /:id/calls — recent call logs for the dashboard
  .get("/:id/calls", async ({ params, query }) => {
    const { id } = params
    const limit = Math.min(Number((query as Record<string, string>).limit ?? 50), 100)

    const rows = await db
      .select({
        id: calls.id,
        callerNumber: calls.callerNumber,
        status: calls.status,
        durationSeconds: calls.durationSeconds,
        summary: calls.summary,
        startedAt: calls.startedAt,
        endedAt: calls.endedAt,
      })
      .from(calls)
      .where(eq(calls.businessId, id))
      .orderBy(desc(calls.startedAt))
      .limit(limit)

    return { calls: rows }
  })

  // GET /:id/usage — minutes used this billing period
  .get("/:id/usage", async ({ params }) => {
    const { id } = params

    const [business] = await db
      .select({ stripePlanId: businesses.stripePlanId })
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1)

    if (!business) return { error: "Business not found" }

    // Sum duration for calls this calendar month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [usage] = await db
      .select({
        totalSeconds: sql<number>`coalesce(sum(${calls.durationSeconds}), 0)::int`,
        totalCalls: sql<number>`count(*)::int`,
      })
      .from(calls)
      .where(and(eq(calls.businessId, id), gte(calls.startedAt, startOfMonth)))

    const minutesUsed = Math.ceil((usage?.totalSeconds ?? 0) / 60)

    return {
      minutesUsed,
      totalCalls: usage?.totalCalls ?? 0,
      stripePlanId: business.stripePlanId,
      periodStart: startOfMonth.toISOString(),
    }
  })

  // GET /:id/knowledge-base
  .get("/:id/knowledge-base", async ({ params }) => {
    const rows = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.businessId, params.id))
      .orderBy(asc(knowledgeBase.sortOrder), asc(knowledgeBase.createdAt))
    return { items: rows }
  })

  // POST /:id/knowledge-base
  .post("/:id/knowledge-base", async ({ params, body }) => {
    const { question, answer, category, sortOrder } = body as {
      question: string; answer: string
      category?: string; sortOrder?: number
    }
    const [item] = await db
      .insert(knowledgeBase)
      .values({
        businessId: params.id,
        question,
        answer,
        category:  category ?? null,
        sortOrder: sortOrder ?? 0,
      })
      .returning()
    return { item }
  }, {
    body: t.Object({
      question:  t.String(),
      answer:    t.String(),
      category:  t.Optional(t.String()),
      sortOrder: t.Optional(t.Number()),
    }),
  })

  // PATCH /:id/knowledge-base/:itemId — edit answer (and optionally question)
  .patch("/:id/knowledge-base/:itemId", async ({ params, body }) => {
    const { answer, question } = body as { answer?: string; question?: string }
    const [item] = await db
      .update(knowledgeBase)
      .set({
        ...(answer   !== undefined ? { answer }   : {}),
        ...(question !== undefined ? { question } : {}),
      })
      .where(eq(knowledgeBase.id, params.itemId))
      .returning()
    return { item }
  }, {
    body: t.Object({
      answer:   t.Optional(t.String()),
      question: t.Optional(t.String()),
    }),
  })

  // DELETE /:id/knowledge-base/:itemId
  .delete("/:id/knowledge-base/:itemId", async ({ params }) => {
    await db
      .delete(knowledgeBase)
      .where(eq(knowledgeBase.id, params.itemId))
    return { deleted: true }
  })

  // POST /:id/knowledge-base/seed — seed defaults for this business type (only if KB is empty)
  .post("/:id/knowledge-base/seed", async ({ params }) => {
    const [business] = await db
      .select({ businessType: businesses.businessType })
      .from(businesses)
      .where(eq(businesses.id, params.id))
      .limit(1)

    if (!business) return { error: "Business not found" }

    const existing = await db
      .select({ id: knowledgeBase.id })
      .from(knowledgeBase)
      .where(eq(knowledgeBase.businessId, params.id))
      .limit(1)

    if (existing.length > 0) return { skipped: true, reason: "KB already has entries" }

    const template = KB_TEMPLATES[business.businessType ?? ""]
    if (!template) return { skipped: true, reason: "No template for this business type" }

    await db.insert(knowledgeBase).values(
      template.map((entry) => ({
        businessId: params.id,
        question:   entry.question,
        answer:     entry.answer,
        category:   entry.category,
        sortOrder:  entry.sortOrder,
      }))
    )

    return { seeded: true, count: template.length }
  })

  // GET /:id/messages — callback requests left by callers when scheduling was unavailable
  .get("/:id/messages", async ({ params, query }) => {
    const limit = Math.min(Number((query as Record<string, string>).limit ?? 50), 100)
    const rows = await db
      .select()
      .from(callbackRequests)
      .where(eq(callbackRequests.businessId, params.id))
      .orderBy(desc(callbackRequests.createdAt))
      .limit(limit)
    return { messages: rows }
  })

  // PATCH /:id/messages/:messageId — mark a callback request as handled
  .patch("/:id/messages/:messageId", async ({ params }) => {
    await db
      .update(callbackRequests)
      .set({ status: "handled" })
      .where(eq(callbackRequests.id, params.messageId))
    return { updated: true }
  })
