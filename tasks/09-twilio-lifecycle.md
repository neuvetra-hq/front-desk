---
status: done
---

# Task 09: Twilio Phone Number Lifecycle (Provision + Release)

## Schema Migration (packages/database)
- [x] Add `twilio_number_sid` (text, nullable, unique) to `businesses` table
- [x] Run `db:generate` + `db:migrate`

## Twilio Service (`apps/api/src/services/twilio.ts`)
- [x] `searchAvailableNumbers(areaCode: string)` — GET /AvailablePhoneNumbers/US/Local.json?VoiceEnabled=true&AreaCode={areaCode}
- [x] `provisionNumber(phoneNumber: string)` — POST /IncomingPhoneNumbers with VoiceUrl set to our webhook endpoint → returns { sid, phoneNumber }
- [x] `releaseNumber(sid: string)` — DELETE /IncomingPhoneNumbers/{sid}

## API Routes (`apps/api/src/routes/businesses.ts`)
- [x] `POST /businesses/:id/provision`
      — auth required (owner/admin only)
      — calls searchAvailableNumbers + provisionNumber
      — saves twilio_number + twilio_number_sid to businesses table
      — sets status = "active"
      — returns the assigned number
- [x] `POST /businesses/:id/release`
      — auth required (owner/admin only)
      — calls releaseNumber with stored twilio_number_sid
      — clears twilio_number + twilio_number_sid from businesses table
      — sets status = "inactive"

## Environment
- [x] Confirm `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WEBHOOK_BASE_URL` in apps/api/.env
- [x] Add `TWILIO_WEBHOOK_BASE_URL` to .env.example (public URL of API, e.g. ngrok for local dev)

## Install
- [x] `bun add twilio` in `apps/api`

## Local Dev Note
- Twilio VoiceUrl must be a publicly reachable URL
- Use `npx ngrok http 3000` to expose localhost during development
- Set TWILIO_WEBHOOK_BASE_URL=https://<ngrok-id>.ngrok.io in .env

## MVP Shortcut (no payment integration yet)
- Provision and release are triggered manually via API call (no Stripe webhook)
- A future task will hook these into the Stripe `customer.subscription.deleted` event

## Acceptance Criteria
- `POST /businesses/:id/provision` purchases a real Twilio number and saves it to DB
- Number's VoiceUrl is set to our webhook endpoint automatically
- `POST /businesses/:id/release` deletes the number from Twilio and clears DB fields
- Business status flips correctly on both operations
- No orphaned Twilio numbers — every purchased number is tracked with its SID
- Twilio credentials never exposed to frontend
