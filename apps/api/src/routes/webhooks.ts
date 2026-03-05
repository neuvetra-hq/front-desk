import { Elysia } from "elysia"

export const webhooks = new Elysia({ prefix: "/webhooks" })
  .post("/twilio", () => {
    // Twilio fires this on every inbound call routed via conditional forwarding.
    // TODO: look up tenant by called Twilio number, connect call to Retell AI.
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    )
  })
  .post("/retell", ({ body }) => {
    // Retell AI sends JSON event payloads (function_call, call_ended, etc.).
    // TODO: dispatch on event type — booking, SMS alert, call transfer.
    return { received: true }
  })
