---
status: done
---

# Task 20: Business Hours Enforcement for Booking & Rescheduling

Ensure no appointment can be booked or rescheduled outside the business's
configured operating hours — even if the calendar slot is technically empty.

## Problem

The existing conflict check (Google freebusy) only tells us if a slot is
*occupied*. It says nothing about whether the slot is within the business's
open hours. A caller could book at 9 PM Sunday if no event happens to block it.

## Solution

Business hours validation sits in the **service layer** (`calendar/index.ts`),
enforced before any calendar API call. No code path can bypass it.
The webhook `check_availability` is also updated to distinguish three cases
and give the AI a specific reason to relay to the caller.

## Validation logic (`assertWithinBusinessHours`)

```
1. Fetch business.aiConfig.businessHours
2. If no hours configured → pass (owner hasn't set hours yet)
3. Is the target day open?  → if not: throw "Business is closed on {day}"
4. Does start..end fit within open..close?
     start < open  OR  end > close  → throw "Outside business hours ({from}–{to})"
5. Pass
```

Called in:
- `bookAppointment` — before creating the event
- `rescheduleAppointment` — before updating the event (after ownership check)

## check_availability smart mode (3 distinct cases)

| Situation                             | AI response                                            |
|---------------------------------------|--------------------------------------------------------|
| Day is closed                         | "Business is closed on {day}. Please choose another day." |
| Within open day but outside hours     | "Outside hours ({from}–{to}). Closest alternatives: …" |
| Within hours but slot occupied        | "That slot is taken. Closest alternatives: …"          |
| Within hours and slot free            | "Available — shall I book it?"                         |

## Checklist

### TDD — failing tests first
- [x] `apps/web/tests/business-hours.spec.ts` — book_appointment outside hours returns hours error
- [x] `apps/web/tests/business-hours.spec.ts` — reschedule outside hours returns hours error
- [x] `apps/web/tests/business-hours.spec.ts` — check_availability on closed day returns closed message

### Service layer (`calendar/index.ts`)
- [x] Import `businesses` table
- [x] Add `assertWithinBusinessHours(businessId, startTime, durationMinutes)`
- [x] Call in `bookAppointment` (before calendar API)
- [x] Call in `rescheduleAppointment` (after ownership check, before calendar API)

### Webhook (`webhooks.ts`)
- [x] `check_availability` smart mode: check business hours BEFORE freebusy
  - closed day → specific "closed" message
  - outside hours → "outside hours" message + alternatives within that day's window
  - slot taken → existing "taken" message + alternatives (unchanged)
- [x] `book_appointment` error handler: surfaces business hours errors verbatim
- [x] `reschedule_appointment` error handler: surfaces business hours errors verbatim

## Done when
- [x] Tests pass: `cd apps/web && bun run test:e2e` (32 passed, 9 skipped pending TEST_BUSINESS_PHONE)
- [x] `book_appointment` at 9 PM Sunday → error, not a created event
- [x] `reschedule_appointment` to closed time → error, not updated
- [x] `check_availability` for closed day → AI says "closed", not "no availability"
- [x] `check_availability` outside hours (e.g., 8 PM) → AI offers in-hours alternatives
