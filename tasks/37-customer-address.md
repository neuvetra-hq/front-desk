---
status: done
---
# Task 37: Customer Address Collection

## What was done
- Added `customerAddress?: string` to `BookAppointmentParams` and `AppointmentRecord` in `types.ts`
- Updated all 3 calendar adapters to store address:
  - **Google**: `location` field + `frontdesk_customer_address` extended property + description line
  - **Outlook**: `location.displayName` + `frontdesk_customer_address` open extension + body line
  - **CalDAV**: `LOCATION` iCal property + `X-FRONTDESK-ADDRESS` custom property + description line
- Added `collect_address` dynamic variable (string `"true"`/`"false"`) to Retell call registration in `webhooks.ts`
- Passed `funcArgs.customer_address` to `bookAppointment` in the `book_appointment` webhook handler
- Added `collectAddress` toggle to Settings AI Agent section (`SettingsTab.tsx`)
  - Per-business toggle, saved to `aiConfig.collectAddress`
  - Pre-fills from existing `aiConfig` on load
- Showed `customerAddress` with a MapPin icon in `EventCard` in `UpcomingEventsTab.tsx`
- Wrote 5 failing tests first (TDD), then implemented

## Key decisions
- Address stored only in the calendar event (no DB column) — single source of truth
- `collect_address` passed as `"true"`/`"false"` string to Retell (dynamic variables are strings)
- Toggle defaults to `false`; Retell flow script must check `collect_address == "true"` before prompting
- Address shown in Upcoming Events tab when present, hidden when absent (no layout shift)
