import { Elysia, t } from "elysia"
import { db, businesses } from "@frontdesk/database"
import { eq } from "drizzle-orm"
import { searchAvailableNumbers, provisionNumber, releaseNumber } from "../services/twilio"

export const businessesRoutes = new Elysia({ prefix: "/businesses" })

  // Update business details (name, type, area code preference)
  .patch("/:id", async ({ params, body }) => {
    const { id } = params
    const { name, businessType, areaCode } = body as {
      name: string
      businessType: string
      areaCode: string
    }

    const [existing] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1)

    if (!existing) return { error: "Business not found" }

    const existingConfig = (existing.aiConfig as Record<string, unknown>) ?? {}

    await db
      .update(businesses)
      .set({
        name,
        businessType: businessType as typeof businesses.$inferInsert["businessType"],
        aiConfig: { ...existingConfig, preferredAreaCode: areaCode },
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))

    return { updated: true }
  }, {
    body: t.Object({
      name: t.String(),
      businessType: t.Union([
        t.Literal("medical"), t.Literal("dental"), t.Literal("spa"),
        t.Literal("salon"), t.Literal("plumbing"), t.Literal("legal"),
        t.Literal("real_estate"), t.Literal("other"),
      ]),
      areaCode: t.String(),
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
