---
status: done
---
# Task 36: CalDAV Calendar Integration

## What to build
Add CalDAV as a third calendar provider, covering Apple iCloud, Fastmail, Nextcloud,
and any other CalDAV-compatible calendar server.

## Why CalDAV
CalDAV is an open standard (RFC 4791). One implementation covers:
- Apple iCloud Calendar
- Fastmail Calendar
- Nextcloud Calendar
- Any self-hosted CalDAV server

## Scope
- Backend: `CaldavCalendarAdapter` using `tsdav` library
- Backend: `POST /calendar/caldav/connect` — credential validation + calendar discovery + store
- Backend: No schema migration needed — reuse existing calendarConnections columns
- Frontend: `CalDAVConnectDialog` component (shadcn Dialog + provider presets)
- Frontend: Redesign SettingsTab calendar section as a clean provider list
- Frontend: Update StepCalendar onboarding to include CalDAV option
- Frontend: `/calendar/caldav/callback` route (fallback protected route)

## Key decisions
- Auth: Basic auth (username + password/app-specific password) — no OAuth
- Column reuse: accessToken=password, refreshToken=serverBaseUrl, providerAccountId=calendarUrl, providerEmail=username
- Calendar discovery: tsdav `createDAVClient` + `fetchCalendars()` auto-discovers via PROPFIND
- Availability: fetch all events via calendarView, treat as busy blocks (same as Outlook)
- Ownership metadata: X-FRONTDESK-* custom iCal properties + DESCRIPTION fallback
- findByCustomerPhone: fetch upcoming events, parse iCal, filter client-side

## Provider presets
- Apple iCloud: serverUrl=https://caldav.icloud.com, password label="App-specific password", help link to Apple docs
- Fastmail: serverUrl=https://caldav.fastmail.com, password label="App password"
- Nextcloud: serverUrl=user-provided, standard username+password
- Other: serverUrl=user-provided

## UI redesign
Calendar section shows a clean provider list (not 3 buttons):
- Row per provider: icon + name + description + connect button
- CalDAV row opens a Dialog for credential entry
- Google/Outlook rows trigger existing OAuth flow
