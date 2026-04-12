import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Appointment management — Retell webhook handlers
//
// These tests hit the API directly via Playwright's request fixture.
// They verify the three new function handlers (find_appointment,
// cancel_appointment, reschedule_appointment) and the updated
// check_availability smart-suggestion mode.
//
// Tests marked with TEST_BUSINESS_PHONE require a real running business:
//   TEST_BUSINESS_PHONE=+1xxx bun run test:e2e
// ---------------------------------------------------------------------------

const API_URL = process.env.API_URL ?? "http://localhost:3000"

// Helper — post a Retell function_call event
async function retellCall(
  request: import("@playwright/test").APIRequestContext,
  funcName: string,
  args: Record<string, unknown>,
  toNumber = "+10000000000",
  fromNumber = "+19999999999",
) {
  return request.post(`${API_URL}/webhooks/retell`, {
    data: {
      event: "function_call",
      name: funcName,
      arguments: args,
      call: { to_number: toNumber, from_number: fromNumber },
    },
  })
}

// ---------------------------------------------------------------------------
// New function names are recognised — these fail before implementation
// (the current fallthrough returns { result: "Unknown function" })
// ---------------------------------------------------------------------------

test.describe("Retell webhook — new appointment functions are recognised", () => {
  const businessPhone = process.env.TEST_BUSINESS_PHONE

  test("find_appointment does not return 'Unknown function'", async ({ request }) => {
    test.skip(!businessPhone, "Set TEST_BUSINESS_PHONE to run: e.g. TEST_BUSINESS_PHONE=+12223334444 bun run test:e2e")
    const res = await retellCall(request, "find_appointment", {}, businessPhone!)
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { result?: string }
    expect(body.result).not.toBe("Unknown function")
    expect(typeof body.result).toBe("string")
  })

  test("cancel_appointment does not return 'Unknown function'", async ({ request }) => {
    test.skip(!businessPhone, "Set TEST_BUSINESS_PHONE to run")
    const res = await retellCall(request, "cancel_appointment", { event_id: "nonexistent-id" }, businessPhone!)
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { result?: string }
    expect(body.result).not.toBe("Unknown function")
    expect(typeof body.result).toBe("string")
  })

  test("reschedule_appointment does not return 'Unknown function'", async ({ request }) => {
    test.skip(!businessPhone, "Set TEST_BUSINESS_PHONE to run")
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    const res = await retellCall(
      request,
      "reschedule_appointment",
      { event_id: "nonexistent-id", new_start_time: tomorrow.toISOString(), duration_minutes: 30 },
      businessPhone!,
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { result?: string }
    expect(body.result).not.toBe("Unknown function")
    expect(typeof body.result).toBe("string")
  })
})

// ---------------------------------------------------------------------------
// check_availability — smart mode (requested_time param)
// ---------------------------------------------------------------------------

test.describe("check_availability — requested_time smart mode", () => {
  const businessPhone = process.env.TEST_BUSINESS_PHONE

  test("with requested_time returns structured result (not raw slot list format)", async ({ request }) => {
    test.skip(!businessPhone, "Set TEST_BUSINESS_PHONE to run")
    const slot = new Date()
    slot.setDate(slot.getDate() + 1)
    slot.setHours(14, 0, 0, 0)

    const res = await retellCall(
      request,
      "check_availability",
      { requested_time: slot.toISOString(), duration_minutes: 30 },
      businessPhone!,
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { result: string }
    expect(typeof body.result).toBe("string")
    // Smart mode: result should mention either "available" or "available times"
    expect(body.result.toLowerCase()).toMatch(/available|times|slot|appointment/)
  })
})

// ---------------------------------------------------------------------------
// Graceful error handling — these run without any test fixtures
// ---------------------------------------------------------------------------

test.describe("Retell webhook — graceful handling (no fixtures needed)", () => {

  test("find_appointment with missing to_number returns structured error", async ({ request }) => {
    const res = await request.post(`${API_URL}/webhooks/retell`, {
      data: {
        event: "function_call",
        name: "find_appointment",
        arguments: {},
        call: {},
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { error?: string }
    expect(body.error).toBe("Missing to_number on call")
  })

  test("cancel_appointment with missing to_number returns structured error", async ({ request }) => {
    const res = await request.post(`${API_URL}/webhooks/retell`, {
      data: {
        event: "function_call",
        name: "cancel_appointment",
        arguments: { event_id: "xyz" },
        call: {},
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { error?: string }
    expect(body.error).toBe("Missing to_number on call")
  })

  test("reschedule_appointment with missing to_number returns structured error", async ({ request }) => {
    const res = await request.post(`${API_URL}/webhooks/retell`, {
      data: {
        event: "function_call",
        name: "reschedule_appointment",
        arguments: { event_id: "xyz", new_start_time: new Date().toISOString() },
        call: {},
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { error?: string }
    expect(body.error).toBe("Missing to_number on call")
  })

  test("find_appointment with unknown business returns graceful result, not a crash", async ({ request }) => {
    const res = await retellCall(request, "find_appointment", {})
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { result?: string; error?: string }
    // Either a result string or a structured error — never a 500
    expect(typeof body.result === "string" || typeof body.error === "string").toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// Ownership guard — scaffolded (requires two seeded sessions)
// ---------------------------------------------------------------------------

// test.describe("Appointment ownership — caller cannot cancel another caller's event", () => {
//   // Requires two test sessions seeded in Supabase with distinct phone numbers
//   // and a real appointment booked for one of them.
//   //
//   // test("cancel_appointment with wrong caller phone returns ownership error", async ({ request }) => {
//   //   const res = await retellCall(request, "cancel_appointment", { event_id: "EVENT_ID_OWNED_BY_OTHER" }, BUSINESS_PHONE, WRONG_CALLER_PHONE)
//   //   const body = await res.json()
//   //   expect(body.result).toMatch(/couldn't find|not found|no appointment/i)
//   // })
// })
