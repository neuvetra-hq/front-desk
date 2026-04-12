---
status: done
---

# Task 22: Unified AI Response Convention

## Problem

The `result` field returned from every Retell function call is the AI's voice — it gets
spoken (or used to compose speech) directly to the caller. Currently the messages are
inconsistent:

- Several say **"Please ask the caller …"** — but the AI *is* talking to the caller, so
  this reads aloud as a meta-instruction, not a message.
- Successful bookings omit the **customer name** and **end time**, leaving the AI to say
  "Appointment confirmed for Monday at 1 PM" with no attribution and no end time.
- Some messages are directives (`"Please ask the caller to choose a different time."`)
  instead of direct conversation (`"Could you choose a different time?"`).
- Error messages don't always give the caller an actionable next step.
- `check_availability` window-mode response is just `"Available times: …"` with no hook.

## Convention

Every `result` string must follow these rules:

| Rule | Correct | Wrong |
|------|---------|-------|
| First-person AI voice | "I've booked you for…" | "The booking was confirmed" |
| Speak *to* the caller | "Could you choose a different day?" | "Please ask the caller to choose a different day." |
| Booking success includes name + start–end time | "John Smith … 1:00 PM to 1:30 PM" | "appointment at 1 PM" |
| Errors include an actionable next step | "Could you try a different time?" | (full stop, nothing offered) |
| Friendly close on success | "Is there anything else I can help you with?" | (abrupt stop) |

The field name stays `result` — that is what Retell reads.
Structured companion data (e.g. `appointments: [...]`) is still allowed alongside `result`.

## Response Templates

### check_availability

| Case | Template |
|------|----------|
| Closed day | "We're closed on {day}. Which day would work better for you?" |
| Outside hours, no slots | "That time is outside our business hours of {from}–{to}. We don't have any other openings that day — could you try a different day?" |
| Outside hours, alternatives exist | "That time is outside our business hours ({from}–{to}). I have openings at {list}. Which of those works for you?" |
| Slot available | "{time} is available. Shall I go ahead and book that?" |
| Slot taken, no alternatives | "{time} is already taken. Could you suggest a different time?" |
| Slot taken, alternatives exist | "{time} is already taken. The closest available times are {list}. Which works best?" |
| Window mode — no slots | "I don't see any availability in that window. Could you try different dates?" |
| Window mode — slots found | "I have the following times available: {list}. Which works for you?" |
| Error | "I'm having trouble checking availability right now. Please try again in a moment." |

### book_appointment

| Case | Template |
|------|----------|
| Success | "Your appointment is confirmed for {start} to {end} for {name}. Is there anything else I can help you with?" |
| Outside hours / closed | (delegated to outsideHoursResponse — see Task 21) |
| Generic error | "I wasn't able to complete the booking just now. Please try again or call back and we'll get that sorted." |

### find_appointment

| Case | Template |
|------|----------|
| None found | "I don't see any upcoming appointments linked to your number." |
| Found | "I found {n} upcoming appointment{s} for you: {list}. Would you like to cancel or reschedule one?" |
| Missing from_number | "I wasn't able to identify your phone number, so I can't look up appointments." |
| Error | "I'm having trouble looking up appointments right now. Please try again in a moment." |

### cancel_appointment

| Case | Template |
|------|----------|
| Success | "Done, that appointment has been cancelled. Is there anything else I can help you with?" |
| Missing from_number | "I wasn't able to verify your phone number, so I can't cancel the appointment." |
| No event_id | "I'm not sure which appointment to cancel — could you clarify which one?" |
| Not found | "I couldn't find that appointment linked to your number, so no changes were made." |
| Error | "I wasn't able to cancel the appointment just now. Please try again in a moment." |

### reschedule_appointment

| Case | Template |
|------|----------|
| Success | "Done! Your appointment has been rescheduled to {newTime}. Is there anything else I can help you with?" |
| Missing from_number | "I wasn't able to verify your phone number, so I can't reschedule the appointment." |
| Missing event/time | "I need both the appointment and the new time to reschedule — could you confirm those details?" |
| Outside hours / closed | (delegated to outsideHoursResponse — see Task 21) |
| Slot taken | "That time slot is already taken — could you choose a different time?" |
| Not found | "I couldn't find that appointment linked to your number, so no changes were made." |
| Error | "I wasn't able to reschedule just now. Please try again in a moment." |

### outsideHoursResponse helper

| Case | Template |
|------|----------|
| Closed day | "We're closed on {day}. Which day would work better for you?" |
| Outside hours, no slots | "{reason} There are no other openings that day — could you try a different day?" |
| Outside hours, alternatives | "{reason} I have openings at {list}. Which of those works for you?" |
| Fallback | "{reason} Could you choose a different time?" |

## Checklist

### TDD — failing tests first
- [x] `apps/web/tests/ai-response-convention.spec.ts` written

### Implementation
- [x] `webhooks.ts` — update all `result` strings to follow convention
- [x] `webhooks.ts` — book_appointment success includes customer name + start–end time
- [x] `webhooks.ts` — no "Please ask the caller" anywhere
- [x] `webhooks.ts` — outsideHoursResponse helper updated

## Done when
- [x] Tests pass: `cd apps/web && bun run test:e2e`
- [x] No `result` string contains "Please ask the caller"
- [x] Booking success includes caller name and end time
- [x] All messages use first-person AI voice
