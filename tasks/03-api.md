---
status: done
---

# Task 03: Backend API (`apps/api`)

- [x] Create `apps/api/src/index.ts` with Elysia app + Eden type export
- [x] Add `GET /health` route returning `{ status: "ok" }`
- [x] Create Twilio webhook stub (`POST /webhooks/twilio`)
- [x] Create Retell AI webhook stub (`POST /webhooks/retell`)
- [x] Create Supabase JWT auth middleware
- [x] Create `.env.example`

## Acceptance Criteria
- `GET /health` returns 200 `{ status: "ok" }`
- `POST /webhooks/twilio` and `/webhooks/retell` accept payloads and return 200
- Protected routes return 401 without a valid Bearer token
