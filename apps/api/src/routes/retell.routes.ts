import { Hono } from "hono";
import { createHmac, timingSafeEqual } from "node:crypto";
import { WebhookEventSchema } from "@front-desk/shared";

export const retellRoutes = new Hono();

function verifySignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  try {
    const hmac = createHmac("sha256", secret);
    hmac.update(rawBody);
    const expected = hmac.digest("hex");
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

// POST /webhooks/retell  (mounted at this prefix in index.ts)
// Target latency: < 200 ms — validate sig, parse, respond 200, defer heavy work.
retellRoutes.post("/", async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-retell-signature") ?? "";
    const secret = process.env.RETELL_WEBHOOK_SECRET ?? "";

    // Validate signature before any other work
    if (!verifySignature(rawBody, signature, secret)) {
      // Return 200 to prevent Retell retry loops; log the failure
      process.stderr.write(
        `[retell] invalid signature for call — rejecting silently\n`,
      );
      return c.json({ received: true }, 200);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return c.json({ received: true }, 200);
    }

    const result = WebhookEventSchema.safeParse(parsed);
    if (!result.success) {
      process.stderr.write(
        `[retell] schema validation failed: ${JSON.stringify(result.error.issues)}\n`,
      );
      return c.json({ received: true }, 200);
    }

    const event = result.data;

    switch (event.event_type) {
      case "call_started":
        // Log only — no blocking I/O on this path
        process.stdout.write(`[retell] call_started: ${event.call_id}\n`);
        break;

      case "call_ended":
        // Stub: transcript persistence deferred to Inngest job
        process.stdout.write(`[retell] call_ended: ${event.call_id}\n`);
        break;

      case "function_call": {
        const fn = event.func_call?.function_name ?? "(unknown)";
        process.stdout.write(
          `[retell] function_call: ${fn} on ${event.call_id}\n`,
        );
        break;
      }
    }

    return c.json({ received: true }, 200);
  } catch (err) {
    // Never let an unhandled error cause Retell to retry-bomb us
    process.stderr.write(`[retell] unhandled error: ${String(err)}\n`);
    return c.json({ received: true }, 200);
  }
});
