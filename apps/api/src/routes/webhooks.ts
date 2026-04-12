import { Elysia } from "elysia"
import { db, businesses, calls } from "@frontdesk/database"
import { eq } from "drizzle-orm"
import { retell } from "../services/retell"
import * as CalendarService from "../services/calendar/index"

const twiml = (xml: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`, {
    headers: { "Content-Type": "text/xml" },
  })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format an ISO datetime string for human speech. */
function formatForSpeech(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday:      "long",
    month:        "long",
    day:          "numeric",
    hour:         "numeric",
    minute:       "2-digit",
    timeZoneName: "short",
  })
}

/**
 * Business hours shape stored in aiConfig.businessHours.
 * Same structure as SettingsTab.tsx DEFAULT_HOURS.
 */
interface DayHours { open: boolean; from: string; to: string }
type BusinessHours = Record<string, DayHours>

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/**
 * Given a Date and a { from: "09:00", to: "17:00" } record,
 * return Date objects for that day's open/close.
 */
function buildDayWindow(date: Date, hours: DayHours): { start: Date; end: Date } {
  const [fh, fm] = hours.from.split(":").map(Number)
  const [th, tm] = hours.to.split(":").map(Number)
  return {
    start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), fh, fm, 0),
    end:   new Date(date.getFullYear(), date.getMonth(), date.getDate(), th, tm, 0),
  }
}

/**
 * Sort time slots by proximity to a target time and return the closest N.
 */
function closestSlots(
  slots: Array<{ start: string; end: string }>,
  target: Date,
  count = 5,
): Array<{ start: string; end: string }> {
  return [...slots]
    .sort((a, b) => {
      const distA = Math.abs(new Date(a.start).getTime() - target.getTime())
      const distB = Math.abs(new Date(b.start).getTime() - target.getTime())
      return distA - distB
    })
    .slice(0, count)
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export const webhooks = new Elysia({ prefix: "/webhooks" })

  // Called by Twilio on every inbound call
  .post("/voice", async ({ body }) => {
    const called = (body as Record<string, string>).To

    if (!called) return twiml("<Hangup/>")

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

    const phoneCall = await retell.call.registerPhoneCall({
      agent_id: agentId,
      from_number: (body as Record<string, string>).From,
      to_number: called,
      direction: "inbound",
      retell_llm_dynamic_variables: {
        business_name: business.name,
      },
    })

    return twiml(
      `<Dial><Sip>sip:${phoneCall.call_id}@sip.retellai.com</Sip></Dial>`
    )
  })

  // Called by Retell AI — handles function calls mid-call and end-of-call events
  .post("/retell", async ({ body }) => {
    const event = body as Record<string, unknown>
    console.log("Retell event:", event.event)

    // ------------------------------------------------------------------
    // Function calls — invoked mid-call by the Retell LLM node
    // ------------------------------------------------------------------
    if (event.event === "function_call") {
      const call      = event.call as Record<string, unknown>
      const funcName  = event.name as string
      const funcArgs  = (event.arguments ?? {}) as Record<string, unknown>

      const toNumber   = call.to_number as string | undefined
      const fromNumber = call.from_number as string | undefined

      if (!toNumber) return { error: "Missing to_number on call" }

      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.twilioNumber, toNumber))
        .limit(1)

      if (!business) return { error: "Business not found" }

      // ----------------------------------------------------------------
      // check_availability
      //
      // Two modes:
      //   Smart mode  — caller requests a specific time (requested_time param)
      //                 Check that exact slot; if busy, return closest free
      //                 alternatives within business hours for that day.
      //   Window mode — (legacy) from + to window; return up to 6 free slots.
      // ----------------------------------------------------------------
      if (funcName === "check_availability") {
        try {
          const duration      = (funcArgs.duration_minutes as number | undefined) ?? 60
          const requestedTime = funcArgs.requested_time as string | undefined

          if (requestedTime) {
            // --- Smart mode ---
            const requested = new Date(requestedTime)
            const reqEnd    = new Date(requested.getTime() + duration * 60 * 1000)

            // Check if the exact requested slot is free
            const exactSlots = await CalendarService.checkAvailability(business.id, {
              from:            requested.toISOString(),
              to:              reqEnd.toISOString(),
              durationMinutes: duration,
            })

            if (exactSlots.length > 0) {
              return { result: `${formatForSpeech(requested.toISOString())} is available. Shall I book it?` }
            }

            // Slot is busy — find closest alternatives within business hours
            const aiConfig     = business.aiConfig as { businessHours?: BusinessHours } | null
            const dayName      = DAY_NAMES[requested.getDay()]
            const todayHours   = aiConfig?.businessHours?.[dayName]

            if (!todayHours?.open) {
              return { result: "That time is not available and the business is closed that day. Please ask the caller for a different date." }
            }

            const { start: dayStart, end: dayEnd } = buildDayWindow(requested, todayHours)
            const allSlots = await CalendarService.checkAvailability(business.id, {
              from:            dayStart.toISOString(),
              to:              dayEnd.toISOString(),
              durationMinutes: duration,
            })

            if (allSlots.length === 0) {
              return { result: `The ${formatForSpeech(requested.toISOString())} slot is taken and there are no other openings that day. Please ask the caller to try another day.` }
            }

            const alternatives = closestSlots(allSlots, requested)
            const formatted = alternatives
              .map((s) => formatForSpeech(s.start))
              .join(", ")

            return {
              result: `${formatForSpeech(requested.toISOString())} is already taken. The closest available times are: ${formatted}. Which works best for the caller?`,
            }
          }

          // --- Window mode (backward-compatible) ---
          const now  = new Date()
          const from = (funcArgs.from as string | undefined) ?? now.toISOString()
          const to   = (funcArgs.to   as string | undefined) ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

          const slots = await CalendarService.checkAvailability(business.id, {
            from,
            to,
            durationMinutes: duration,
          })

          if (slots.length === 0) {
            return { result: "No availability found in the requested window. Please ask the caller to try different dates." }
          }

          const formatted = slots.map((s) => formatForSpeech(s.start)).join(", ")
          return { result: `Available times: ${formatted}` }

        } catch (err) {
          console.error("check_availability error:", err)
          return { result: "Unable to check availability right now. Please ask the caller to call back or try another time." }
        }
      }

      // ----------------------------------------------------------------
      // book_appointment
      // ----------------------------------------------------------------
      if (funcName === "book_appointment") {
        try {
          const booking = await CalendarService.bookAppointment(business.id, {
            startTime:       funcArgs.start_time as string,
            durationMinutes: (funcArgs.duration_minutes as number | undefined) ?? 60,
            customerName:    funcArgs.customer_name as string,
            customerPhone:   funcArgs.customer_phone as string ?? fromNumber ?? "",
            customerEmail:   funcArgs.customer_email as string | undefined,
            reason:          funcArgs.reason as string,
          })

          return {
            result: `Appointment confirmed for ${formatForSpeech(booking.startTime)}. A calendar invite has been created.`,
          }
        } catch (err) {
          console.error("book_appointment error:", err)
          return { result: "Unable to book the appointment right now. Please ask the caller to call back and we will get that sorted." }
        }
      }

      // ----------------------------------------------------------------
      // find_appointment
      // Uses the caller's Twilio from_number as the ownership key.
      // The AI never needs to ask the caller for an ID.
      // ----------------------------------------------------------------
      if (funcName === "find_appointment") {
        try {
          if (!fromNumber) {
            return { result: "I couldn't identify the caller's phone number. Unable to look up appointments." }
          }

          const appointments = await CalendarService.findAppointmentsByPhone(business.id, fromNumber)

          if (appointments.length === 0) {
            return { result: "I couldn't find any upcoming appointments for this caller." }
          }

          const list = appointments
            .map((a, i) => `${i + 1}. ${a.reason} on ${formatForSpeech(a.startTime)}`)
            .join("; ")

          return {
            result: `I found ${appointments.length} upcoming appointment${appointments.length > 1 ? "s" : ""}: ${list}. Would the caller like to cancel or reschedule one?`,
            // Pass the raw appointment data so the AI can reference event IDs internally
            appointments: appointments.map((a) => ({ eventId: a.eventId, summary: a.summary, startTime: a.startTime })),
          }
        } catch (err) {
          console.error("find_appointment error:", err)
          return { result: "Unable to look up appointments right now. Please ask the caller to call back." }
        }
      }

      // ----------------------------------------------------------------
      // cancel_appointment
      // event_id comes from a prior find_appointment result held in the
      // AI's context — the caller never speaks it aloud.
      // Ownership is re-verified server-side via the caller's phone.
      // ----------------------------------------------------------------
      if (funcName === "cancel_appointment") {
        try {
          if (!fromNumber) {
            return { result: "I couldn't verify the caller's phone number. Unable to cancel." }
          }

          const eventId = funcArgs.event_id as string
          if (!eventId) {
            return { result: "No appointment was selected. Please ask the caller which appointment they want to cancel." }
          }

          await CalendarService.cancelAppointment(business.id, fromNumber, eventId)

          return { result: "The appointment has been cancelled. Is there anything else I can help with?" }
        } catch (err) {
          const msg = (err as Error).message ?? ""
          console.error("cancel_appointment error:", err)
          if (msg.includes("No appointment found")) {
            return { result: "I couldn't find that appointment linked to this caller's number. No changes were made." }
          }
          return { result: "Unable to cancel the appointment right now. Please ask the caller to call back." }
        }
      }

      // ----------------------------------------------------------------
      // reschedule_appointment
      // event_id from prior find_appointment; new_start_time from caller.
      // Ownership re-verified; new slot availability checked before patching.
      // ----------------------------------------------------------------
      if (funcName === "reschedule_appointment") {
        try {
          if (!fromNumber) {
            return { result: "I couldn't verify the caller's phone number. Unable to reschedule." }
          }

          const eventId      = funcArgs.event_id as string
          const newStartTime = funcArgs.new_start_time as string
          const duration     = (funcArgs.duration_minutes as number | undefined) ?? 60

          if (!eventId || !newStartTime) {
            return { result: "Missing appointment or new time. Please confirm which appointment and what time the caller wants." }
          }

          const updated = await CalendarService.rescheduleAppointment(
            business.id,
            fromNumber,
            eventId,
            newStartTime,
            duration,
          )

          return {
            result: `Appointment rescheduled to ${formatForSpeech(updated.startTime)}. The calendar has been updated.`,
          }
        } catch (err) {
          const msg = (err as Error).message ?? ""
          console.error("reschedule_appointment error:", err)
          if (msg.includes("No appointment found")) {
            return { result: "I couldn't find that appointment linked to this caller's number. No changes were made." }
          }
          if (msg.includes("not available")) {
            return { result: "That new time slot is already taken. Please ask the caller to choose a different time." }
          }
          return { result: "Unable to reschedule right now. Please ask the caller to call back." }
        }
      }

      return { result: "Unknown function" }
    }

    // ------------------------------------------------------------------
    // call_ended — save transcript + summary to calls table
    // ------------------------------------------------------------------
    if (event.event === "call_ended") {
      const call = event.call as Record<string, unknown> | undefined
      if (call?.call_id) {
        await db
          .update(calls)
          .set({
            status:          "completed",
            transcript:      call.transcript as string | undefined ?? null,
            summary:         (call.call_analysis as Record<string, unknown> | undefined)?.call_summary as string | undefined ?? null,
            durationSeconds: call.duration_ms ? Math.round((call.duration_ms as number) / 1000) : null,
            endedAt:         new Date(),
          })
          .where(eq(calls.retellCallId, call.call_id as string))
      }
    }

    return { received: true }
  })
