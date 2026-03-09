import { Elysia } from "elysia"
import { db, businesses } from "@frontdesk/database"
import { eq } from "drizzle-orm"
import { retell } from "../services/retell"

const twiml = (xml: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`, {
    headers: { "Content-Type": "text/xml" },
  })

export const webhooks = new Elysia({ prefix: "/webhooks" })

  // Called by Twilio on every inbound call
  .post("/voice", async ({ body }) => {
    const called = (body as Record<string, string>).To

    if (!called) return twiml("<Hangup/>")

    // Look up the business that owns this Twilio number
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.twilioNumber, called))
      .limit(1)

    if (!business) {
      console.error(`No business found for number ${called}`)
      return twiml("<Say>Sorry, this number is not configured. Goodbye.</Say><Hangup/>")
    }

    const agentId = Bun.env.RETELL_AGENT_ID ?? ""

    // Register the call with Retell → get call_id for SIP URI
    const phoneCall = await retell.call.registerPhoneCall({
      agent_id: agentId,
      from_number: (body as Record<string, string>).From,
      to_number: called,
      direction: "inbound",
      retell_llm_dynamic_variables: {
        business_name: business.name,
      },
    })

    // Return TwiML that hands the call off to Retell via SIP
    return twiml(
      `<Dial><Sip>sip:${phoneCall.call_id}@sip.retellai.com</Sip></Dial>`
    )
  })

  // Called by Retell AI at end of call with transcript, summary, etc.
  .post("/retell", async ({ body }) => {
    const event = body as Record<string, unknown>
    console.log("Retell event:", event.event)
    // TODO: on call_ended → save transcript + summary to calls table
    return { received: true }
  })
