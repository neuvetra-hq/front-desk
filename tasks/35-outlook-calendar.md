---
status: done
---
# Task 35: Outlook Calendar Integration

## What to build
Add Microsoft Outlook / Office 365 calendar as a second calendar provider option alongside Google Calendar.

## Scope
- Backend: Microsoft OAuth flow (auth-url + callback routes)
- Backend: Full `OutlookCalendarAdapter` (Microsoft Graph API)
- Backend: Fix disconnect route to be provider-agnostic
- Frontend: Update SettingsTab to show both Google and Outlook connect options

## Key decisions
- One active calendar per business at a time — connecting Outlook deactivates Google (and vice versa)
- Ownership metadata stored in Microsoft Graph open extensions (`com.frontdesk.booking`)
- `findByCustomerPhone`: fetch upcoming events with `$expand=extensions`, filter client-side
- `checkAvailability`: use `/me/calendarView` (all events = busy blocks) to compute free slots
- `getUpcomingEvents`: use `/me/calendarView` for all events (same as Google — all events, not just FD-booked)
- Microsoft OAuth endpoints use `/common/` tenant for personal + business accounts

## Routes added
- `GET /calendar/microsoft/auth-url?businessId=xxx`
- `GET /calendar/microsoft/callback?code=xxx&state=base64(businessId)`
- `DELETE /calendar/:businessId` — updated to deactivate any active provider

## Env vars required
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_REDIRECT_URI`
