---
status: done
---

# Task 21: Outside-Hours Booking UX — Reject with Alternatives

## Problem

Two related issues:

1. **Test event button** silently picks a different day (Monday 1 PM) when today is
   closed. The user has no idea the day changed. A test button should be predictable.

2. **Production `book_appointment`** currently throws "outside business hours" and
   returns just that string — the AI has nothing to offer the caller next.
   The caller experience is: "That time is outside hours." Full stop.
   The AI then has to make a *second* function call to find alternatives.

## Solution

### Test event button
- Drop the "find next open day" loop entirely.
- Always try TODAY at 10:00 AM (a predictable, safe default within any standard day).
- If today is closed or 10 AM is outside hours → return a clear 400 error:
  "Today is {day} which is outside business hours. Open days: Mon–Fri."
- Show the exact booked date in the success toast so the user always knows when.

### Production book_appointment + reschedule_appointment
- When `assertWithinBusinessHours` throws, catch the specific reason and immediately
  fetch free alternatives within that day's business hours window.
- Return both the reason AND the alternatives in one response so the AI can say:
  "{time} is outside business hours. I have openings at {A}, {B}, {C} — which works?"
- No second function call needed.

## Webhook response shapes

Outside hours (book or reschedule):
```json
{
  "result": "2:00 AM is outside business hours (09:00–17:00 on Tuesday). Available times that day are: 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM. Which works for the caller?"
}
```

Closed day:
```json
{
  "result": "The business is closed on Sunday. Please ask the caller for a different day."
}
```

## Checklist

### TDD — failing tests written first
- [x] `apps/web/tests/booking-ux.spec.ts` — book_appointment outside hours returns reason + alternatives
- [x] `apps/web/tests/booking-ux.spec.ts` — book_appointment on closed day returns closed message (no alternatives)
- [x] `apps/web/tests/booking-ux.spec.ts` — reschedule outside hours returns reason + alternatives

### API — test event endpoint (`routes/calendar.ts`)
- [x] Remove "find next open day" loop
- [x] Always use today at 10:00 AM
- [x] Return 400 with clear message if today is closed or 10 AM is outside hours

### Frontend — SettingsTab (`SettingsTab.tsx`)
- [x] Success toast shows date + time, not just summary

### Webhooks (`routes/webhooks.ts`)
- [x] `book_appointment`: outside-hours error → re-fetch alternatives → return reason + alternatives
- [x] `reschedule_appointment`: same treatment

## Done when
- [x] Tests pass: `cd apps/web && bun run test:e2e`
- [x] Test button on a closed day returns a clear error (not a silent rebook)
- [x] Test button success toast shows "Test event created for Monday Apr 14 at 10:00 AM"
- [x] AI response to "book at 2 AM" includes alternatives in the same turn
- [x] AI response to "book on Sunday" says "closed on Sunday"
