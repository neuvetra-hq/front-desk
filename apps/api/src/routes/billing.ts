import { Elysia, t } from "elysia"
import { db, businesses, businessMembers, users } from "@frontdesk/database"
import { eq } from "drizzle-orm"
import { stripe, PLANS, type PlanId } from "../services/stripe"
import { provisionNumber } from "../services/twilio"

export const billingRoutes = new Elysia({ prefix: "/billing" })

  /**
   * POST /billing/setup-intent
   *
   * Called when the user reaches the payment step. Creates (or retrieves) a
   * Stripe Customer for this user and returns a SetupIntent client_secret so
   * the frontend can render the Stripe PaymentElement without any card data
   * ever touching our server.
   */
  .post("/setup-intent", async ({ body }) => {
    const { userId, email, name } = body

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!user) return { error: "User not found" }

    // Reuse existing Stripe customer if we already created one
    // (edge case: user refreshes the payment step)
    const existingBusiness = await db
      .select()
      .from(businessMembers)
      .innerJoin(businesses, eq(businessMembers.businessId, businesses.id))
      .where(eq(businessMembers.userId, userId))
      .limit(1)

    const existingCustomerId = existingBusiness[0]?.businesses?.stripeCustomerId

    let customerId = existingCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        name,
        phone: user.phone ?? undefined,
        email: email ?? undefined,
        metadata: { userId },
      })
      customerId = customer.id
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session", // allows future charges without user present
      payment_method_types: ["card"],
    })

    return {
      clientSecret: setupIntent.client_secret,
      customerId,
    }
  }, {
    body: t.Object({
      userId: t.String(),
      name: t.String(),
      email: t.Optional(t.String()),
    }),
  })

  /**
   * POST /billing/activate
   *
   * The single activation call at the end of signup. Atomically:
   *   1. Creates the business record in the DB
   *   2. Creates a Stripe Subscription (flat fee + metered) with 7-day trial
   *   3. Provisions the Twilio phone number
   *   4. Updates the business with all IDs and sets status = active
   *
   * If Stripe or Twilio fail, the business is left in inactive state and no
   * money is charged / no number is purchased.
   */
  .post("/activate", async ({ body }) => {
    const { userId, businessName, businessType, phoneNumber, planId, paymentMethodId, stripeCustomerId } = body

    const plan = PLANS[planId as PlanId]
    if (!plan) return { error: "Invalid plan" }

    // 1. Create the business in DB (inactive until everything succeeds)
    const slug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`

    const [business] = await db
      .insert(businesses)
      .values({
        name: businessName,
        slug,
        businessType: businessType as typeof businesses.$inferInsert["businessType"],
        status: "inactive",
        stripeCustomerId,
      })
      .returning()

    await db.insert(businessMembers).values({
      businessId: business.id,
      userId,
      role: "owner",
    })

    try {
      // 2. Ensure payment method is attached and set as default
      // Ignore "already attached" errors — both outcomes are fine
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId })
      } catch {
        // already attached — that's fine
      }
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })

      // 3. Create subscription: flat fee + metered usage, 7-day trial
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          { price: plan.flatPriceId },
          { price: plan.meteredPriceId },
        ],
        trial_period_days: 7,
        metadata: { businessId: business.id, planId },
      })

      // 4. Provision Twilio number — may fail if number was taken by someone else
      let purchased: Awaited<ReturnType<typeof provisionNumber>>
      try {
        purchased = await provisionNumber(phoneNumber)
      } catch {
        // Cancel the subscription so the customer isn't charged
        await stripe.subscriptions.cancel(subscription.id)
        return {
          error: "That number was just taken by someone else. Please go back and pick a different one.",
          code: "number_unavailable",
        }
      }

      // 5. Mark business as active with all IDs
      await db
        .update(businesses)
        .set({
          status: "active",
          twilioNumber: purchased.phoneNumber,
          twilioNumberSid: purchased.sid,
          stripeSubscriptionId: subscription.id,
          stripePlanId: plan.flatPriceId,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, business.id))

      console.log(`✅ Activated business ${business.id} — Twilio: ${purchased.phoneNumber}, Stripe: ${subscription.id}`)

      return {
        businessId: business.id,
        phoneNumber: purchased.phoneNumber,
        plan: planId,
      }
    } catch (err) {
      // Leave business inactive — user can retry. Don't delete it so we keep
      // the customer link for retry attempts.
      console.error("Activation failed:", err)
      return { error: (err as Error).message ?? "Activation failed" }
    }
  }, {
    body: t.Object({
      userId: t.String(),
      businessName: t.String(),
      businessType: t.Union([
        t.Literal("medical"), t.Literal("dental"), t.Literal("spa"),
        t.Literal("salon"), t.Literal("plumbing"), t.Literal("legal"),
        t.Literal("real_estate"), t.Literal("other"),
      ]),
      phoneNumber: t.String(),
      planId: t.Union([t.Literal("starter"), t.Literal("growth"), t.Literal("pro")]),
      paymentMethodId: t.String(),
      stripeCustomerId: t.String(),
    }),
  })

  /**
   * POST /billing/report-usage
   *
   * Called from the Retell webhook when a call ends. Reports call duration
   * in minutes to Stripe via the Billing Meters API so overage charges are
   * calculated automatically at the end of each billing period.
   */
  .post("/report-usage", async ({ body }) => {
    const { businessId, durationSeconds } = body

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1)

    if (!business?.stripeCustomerId) {
      return { reported: false, reason: "No Stripe customer found" }
    }

    // Round up to nearest whole minute (billing standard)
    const minutes = Math.ceil(durationSeconds / 60)

    // Stripe Billing Meters API (stripe-node v16+)
    await stripe.billing.meterEvents.create({
      event_name: Bun.env.STRIPE_METER_EVENT_NAME ?? "front_desk_minutes",
      payload: {
        stripe_customer_id: business.stripeCustomerId,
        value: String(minutes),
      },
    })

    return { reported: true, minutes }
  }, {
    body: t.Object({
      businessId: t.String(),
      durationSeconds: t.Number(),
    }),
  })
