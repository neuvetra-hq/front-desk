---
status: done
---

# Task 19: Appointment Management — Find, Cancel, Reschedule

Enable callers to find, cancel, and reschedule their own appointments via the AI agent.
Calendar stays the **single source of truth** — no duplicate data in Postgres.

## Design principles

- **Calendar is source of truth.** No `appointments` table — all data lives in the calendar provider.
- **Provider-agnostic.** Each `CalendarAdapter` implements `findByCustomerPhone`, `cancelEvent`,
  `updateEvent`. The service layer and webhook handlers never know which provider is used.
- **Ownership via phone number.** The caller's phone (from Twilio) is the lookup key. The server
  re-verifies ownership before any mutation — the AI never bypasses this check.
- **Smart availability.** When a caller requests a specific time that is busy, the API finds the
  closest free slots within business hours and returns them as alternatives.

## Adapter interface additions (`types.ts`)

```
AppointmentRecord       — shape returned by findByCustomerPhone
UpdateEventParams       — { startTime, durationMinutes }
BookAppointmentParams   — add optional customerEmail field

CalendarAdapter methods added:
  findByCustomerPhone(connection, phone)  → AppointmentRecord[]
  cancelEvent(connection, eventId)        → void
  updateEvent(connection, eventId, params)→ void
```

## Provider implementations

| Method               | Google                                  | Outlook (stub) | CalDAV (stub) |
|----------------------|-----------------------------------------|----------------|---------------|
| bookAppointment      | store phone/email in extendedProperties | stub           | stub          |
| findByCustomerPhone  | privateExtendedProperty query param     | stub           | stub          |
| cancelEvent          | DELETE /events/:id                      | stub           | stub          |
| updateEvent          | PATCH /events/:id                       | stub           | stub          |

## Service layer additions (`calendar/index.ts`)

```
findAppointmentsByPhone(businessId, phone)
cancelAppointment(businessId, customerPhone, eventId)   — verifies ownership before deleting
rescheduleAppointment(businessId, customerPhone, eventId, newStartTime, durationMinutes)
```

## Webhook handlers (`webhooks.ts`)

| Function name           | Args from Retell                              | Notes                                                              |
|-------------------------|-----------------------------------------------|--------------------------------------------------------------------|
| check_availability      | requested_time?, from?, to?, duration_minutes | Smart: if requested_time busy → return closest alternatives within business hours |
| find_appointment        | (none — uses call.from_number)                | Returns upcoming confirmed appointments                            |
| cancel_appointment      | event_id                                      | Verifies caller owns the event via phone                           |
| reschedule_appointment  | event_id, new_start_time, duration_minutes    | Verifies ownership + checks new slot free before patching          |

## Checklist

### TDD — failing tests written first
- [x] `apps/web/tests/appointments.spec.ts` — new function names not "Unknown function"
- [x] check_availability with requested_time returns structured response
- [x] Graceful error tests (missing to_number, unknown business) — run without fixtures

### Types
- [x] Add `AppointmentRecord`, `UpdateEventParams` to `types.ts`
- [x] Add `customerEmail?` to `BookAppointmentParams`
- [x] Add `findByCustomerPhone`, `cancelEvent`, `updateEvent` to `CalendarAdapter` interface

### Google adapter
- [x] `bookAppointment` — embed phone/email/name/reason in `extendedProperties.private`
- [x] `findByCustomerPhone` — `privateExtendedProperty` query, returns `AppointmentRecord[]`
- [x] `cancelEvent` — DELETE /calendars/primary/events/:id
- [x] `updateEvent` — PATCH /calendars/primary/events/:id (start/end)

### Outlook adapter
- [x] Stub `findByCustomerPhone`, `cancelEvent`, `updateEvent` (with implementation notes)

### Service layer
- [x] `findAppointmentsByPhone`
- [x] `cancelAppointment` — re-queries by phone to verify ownership before deleting
- [x] `rescheduleAppointment` — ownership check + new slot availability check before patching

### Webhooks
- [x] `check_availability` — smart mode: if `requested_time` is busy, scan business hours and return closest free alternatives
- [x] `find_appointment` — uses `call.from_number` automatically, no ID required from caller
- [x] `cancel_appointment` — event_id held in AI context; server re-verifies ownership via phone
- [x] `reschedule_appointment` — ownership + availability verified before update

## Done When

- [x] Tests pass: `cd apps/web && bun run test:e2e` (31 passed, 4 skipped pending `TEST_BUSINESS_PHONE`)
- [x] Caller can say "find my appointment" → AI lists it *(code complete; live call verification pending)*
- [x] Caller can say "cancel my appointment" → AI cancels it, verified by phone *(code complete; live call verification pending)*
- [x] Caller can say "reschedule to Friday 2pm" → AI checks slot, updates event *(code complete; live call verification pending)*
- [x] Caller cannot cancel another caller's appointment — ownership re-verified server-side
- [x] If requested slot is busy, AI offers closest free alternatives within business hours

## Live call testing (when ready)

To fully verify the Retell handlers end-to-end:
1. Set `TEST_BUSINESS_PHONE` to your Twilio number and run `bun run test:e2e` — the 4 skipped tests will run
2. Make a real call and say "find my appointment", "cancel my appointment", "book me at 5pm Tuesday"
3. Verify events appear / disappear in Google Calendar
