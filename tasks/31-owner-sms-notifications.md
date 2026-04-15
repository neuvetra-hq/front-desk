---
status: done
---
# Task 31: Owner SMS Notifications

## What was done
- Created `apps/api/src/services/notify.ts` — `notifyOwnerAppointment()` fires SMS on book/cancel/reschedule/callback
- Added `sendSms()` to `apps/api/src/services/twilio.ts`
- Wired into `webhooks.ts` for all appointment actions (fire-and-forget, never throws)
- Fixed `cancelAppointment` to return the cancelled event so time is included in the cancellation SMS
- Updated consent language in `StepIdentity.tsx` and `TermsPage.tsx` to cover all SMS types

## Key decisions
- Fire-and-forget: notifications never block or break the Retell response
- A2P compliance: no URLs in SMS body initially; pending new campaign approval to add dashboard link
- Cancellation SMS now includes the time of the cancelled appointment
- Owner phone looked up via `business_members JOIN users WHERE role='owner'`
