import { Elysia } from "elysia"
import twilio from "twilio"
import { retell } from "../services/retell"

const AccessToken = twilio.jwt.AccessToken
const VoiceGrant = AccessToken.VoiceGrant
const VoiceResponse = twilio.twiml.VoiceResponse

export const voiceRoutes = new Elysia()
  .get("/voice-token", () => {
    const token = new AccessToken(
      Bun.env.TWILIO_ACCOUNT_SID!,
      Bun.env.TWILIO_API_KEY_SID!,
      Bun.env.TWILIO_API_SECRET!,
      { identity: "browser-caller", ttl: 3600 }
    )
    token.addGrant(new VoiceGrant({
      outgoingApplicationSid: Bun.env.TWILIO_TWIML_APP_SID!,
    }))
    return { token: token.toJwt() }
  })
  // Browser click-to-call: register directly with Retell and return SIP TwiML.
  // Bypasses dialing the phone number, so Retell's disconnect propagates
  // cleanly back to the browser without a double-hop.
  .post("/voice/outbound", async ({ body, set }) => {
    const raw = (body as Record<string, string>).From ?? ""
    // Browser callers send "client:browser-caller" — use our number as fallback
    const from = raw.startsWith("+") ? raw : Bun.env.TWILIO_PHONE_NUMBER!
    const agentId = Bun.env.NEUVETRA_AGENT_ID ?? ""

    const phoneCall = await retell.call.registerPhoneCall({
      agent_id:    agentId,
      from_number: from,
      to_number:   Bun.env.TWILIO_PHONE_NUMBER!,
      direction:   "inbound",
    })

    const response = new VoiceResponse()
    response.dial().sip(`sip:${phoneCall.call_id}@sip.retellai.com`)
    set.headers["content-type"] = "text/xml"
    return response.toString()
  })
