---
status: done
---

# Task 18: Calendar Integration — Google OAuth (Provider-Agnostic)

Replace the defunct Cal.com self-hosted setup with a scalable, provider-agnostic calendar integration. Start with Google Calendar; architecture is designed to add Outlook, Apple CalDAV, etc. without schema changes.

## Goals

- [x] Provider-agnostic `calendar_connections` table (enum-driven, not column-per-provider)
- [x] Google OAuth flow: connect, store tokens, disconnect
- [x] `CalendarService` with `GoogleCalendarAdapter` (check availability, book appointment)
- [x] Retell AI function call handlers: `check_availability`, `book_appointment`
- [x] Dashboard Settings UI: Calendar section (connect / connected state / disconnect)
- [x] TDD: Playwright tests written first, implementation makes them pass

## Architecture

### `calendar_connections` table
```
id                   uuid PK
business_id          uuid FK → businesses (cascade)
provider             enum: 'google' | 'outlook' | 'apple' | 'caldav'
provider_account_id  text  — Google sub / Outlook oid (dedup key)
provider_email       text  — display ("Connected as john@gmail.com")
access_token         text  — encrypted at rest
refresh_token        text  — encrypted at rest
token_expiry         timestamp
is_active            boolean default true
created_at           timestamp
updated_at           timestamp
```
Unique constraint: `(business_id, provider)` — one active connection per provider per business.

### Service layer
```
services/calendar/
  types.ts          — CalendarAdapter interface, shared types
  google.ts         — GoogleCalendarAdapter (freebusy.query, events.insert, token refresh)
  outlook.ts        — stub, ready for future
  index.ts          — CalendarService router (picks adapter by provider)
```

### OAuth flow
1. User clicks "Connect Google Calendar" in Settings
2. Frontend calls `GET /calendar/auth-url?businessId=xxx` → gets consent URL
3. User is redirected to Google consent screen
4. Google redirects to `https://api.neuvetra.com/calendar/callback?code=xxx&state=businessId`
5. API exchanges code for tokens, upserts `calendar_connections` row
6. API redirects to `https://neuvetra.com/dashboard?calendar=connected`

## Checklist

### Schema & Migration
- [x] Add `calendar_provider` enum to Drizzle schema
- [x] Add `calendar_connections` table to Drizzle schema
- [x] Remove `calcom_api_key` column from `businesses`
- [x] Run `bun run db:generate` to produce migration SQL (`0005_calendar_integration.sql`)
- [x] Run `bun run db:push` to apply to Supabase

### TDD — Write failing tests first
- [x] `apps/web/tests/calendar.spec.ts` — unauthenticated: callback page redirects to /login
- [x] Authenticated tests scaffolded (commented, storageState note)

### Backend
- [x] `services/calendar/types.ts` — CalendarAdapter interface
- [x] `services/calendar/google.ts` — GoogleCalendarAdapter
- [x] `services/calendar/outlook.ts` — stub
- [x] `services/calendar/index.ts` — CalendarService router
- [x] `routes/calendar.ts` — GET /calendar/auth-url, GET /calendar/callback, DELETE /calendar/:businessId
- [x] Register calendar routes in `apps/api/src/index.ts`
- [x] Update `webhooks.ts` Retell handler for `check_availability` + `book_appointment`

### Frontend
- [x] `CalendarCallbackPage.tsx` — handles OAuth return, shows loading spinner, redirects to dashboard
- [x] Register `/calendar/callback` route in `App.tsx`
- [x] `SettingsTab.tsx` — Calendar section (Connect button / connected state / Disconnect)

### Environment Variables
- [x] `GOOGLE_CLIENT_ID` added to `.env.example`
- [x] `GOOGLE_CLIENT_SECRET` added to `.env.example`
- [x] `GOOGLE_REDIRECT_URI=https://api.neuvetra.com/calendar/callback` in `.env.example`

## Done When

- [x] `bun run db:push` applies the migration cleanly
- [x] Business owner can connect Google Calendar from Settings tab
- [x] Connected account email displayed in Settings
- [x] Disconnect removes the token row
- [x] Retell `check_availability` returns real free slots from Google Calendar
- [x] Retell `book_appointment` creates a real event on Google Calendar
- [x] `bun run test:e2e` still passes (no regressions)

## Notes
- Drizzle does NOT manage triggers — only tables/enums. Migration via `db:generate` + `db:push`.
- Token refresh: Google access tokens expire in 1 hour. Refresh using stored refresh_token before every API call.
- `state` param in OAuth URL = `businessId` (base64 encoded). Validated on callback.
- Outlook support: same table, new enum value, new adapter file — zero schema changes needed.
