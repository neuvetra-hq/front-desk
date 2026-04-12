---
status: done
---

# Task 23: Graceful No-Calendar Handling

## Problem

When a business has no calendar connected (never set one up, or disconnected it):

1. **Caller experience**: Every calendar function falls through to the generic error handler
   and the AI says "I wasn't able to complete the booking just now." The caller has no idea
   why — it sounds like a temporary glitch. In reality the business's scheduling system
   is not connected and the problem won't resolve on its own.

2. **Business owner experience**: No warning anywhere in the dashboard. The owner doesn't
   know their AI is silently failing on every booking-related call.

## Solution

### Webhook pre-check (single point, not scattered across 5 handlers)
Before dispatching to any calendar function, check for an active connection.
If none → return a specific, honest message the AI can deliver to the caller:

```
"I'm not able to check availability or book appointments right now —
our scheduling system isn't connected. Please contact us directly to schedule."
```

This fires for: check_availability, book_appointment, find_appointment,
cancel_appointment, reschedule_appointment.

### Dashboard warning banner
Persistent amber banner below the tab bar, visible on every tab, shown whenever
no calendar is connected. Includes a "Connect calendar" button that navigates
directly to the Settings tab.

```
⚠ No calendar connected — your AI can answer calls but cannot book appointments.
  [Connect calendar →]
```

The banner disappears once the business connects (page refresh or session refresh).

## Checklist

### TDD — failing tests first
- [x] `apps/web/tests/no-calendar.spec.ts` written

### Implementation
- [x] `apps/api/src/routes/webhooks.ts` — add pre-check before calendar function dispatch
- [x] `apps/web/src/pages/DashboardPage.tsx` — fetch calendar status, show warning banner

## Done when
- [x] Tests pass
- [x] Caller hears a specific "scheduling system not connected" message (not generic error)
- [x] Dashboard shows amber banner when no calendar connected
- [x] Banner "Connect calendar" button navigates to Settings tab
