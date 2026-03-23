---
status: in-progress
---

# Task 16: Railway Deployment

Deploy both services to Railway under one project.
Domain: neuvetra.com (company landing) + app.neuvetra.com (dashboard) + api.neuvetra.com (API).

## Why Railway
- Single platform for Bun API (long-running process) + Vite static frontend
- Simpler than Vercel (no serverless limitations) + Railway supports Bun natively
- One dashboard, one bill (~$5/mo Hobby plan)

## Services

### Service 1 — API (`apps/api`)
- [ ] Create Railway project from `neuvetra-hq/front-desk` repo
- [ ] Set Root Directory: `apps/api`
- [ ] Railway auto-detects `railway.toml` — start command: `bun run src/index.ts`
- [ ] Add all env vars from `apps/api/.env`:
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
  - `TWILIO_WEBHOOK_BASE_URL` ← set to Railway API public URL after first deploy
  - `TWILIO_MESSAGE_SERVICE_SID`
  - `RETELL_API_KEY`
  - `RETELL_AGENT_ID`
  - `PORT` = 3000
- [ ] Assign custom domain: `api.neuvetra.com`
- [ ] Update `TWILIO_WEBHOOK_BASE_URL` to `https://api.neuvetra.com`

### Service 2 — Web (`apps/web`)
- [ ] Add new service to same Railway project from same repo
- [ ] Set Root Directory: `apps/web`
- [ ] Railway auto-detects `railway.toml` — build: `bun run build`, serve: `dist/`
- [ ] Add env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - `VITE_API_URL` = `https://api.neuvetra.com`
- [ ] Assign custom domain: `app.neuvetra.com`

## DNS (via domain registrar)
- [ ] `api.neuvetra.com` → CNAME to Railway API service domain
- [ ] `app.neuvetra.com` → CNAME to Railway web service domain
- [ ] `neuvetra.com` → points to web service (task 14 landing page)

## Config Files Added
- `apps/api/railway.toml` — start command for Bun API
- `apps/web/railway.toml` — build + serve for Vite SPA

## Post-Deploy Checklist
- [ ] OTP signup flow works end-to-end in production
- [ ] Twilio webhooks hitting `https://api.neuvetra.com/webhooks/...`
- [ ] Retell AI webhook URL updated in Retell dashboard
- [ ] A2P 10DLC resubmitted with CTA = `https://app.neuvetra.com/signup`

## Acceptance Criteria
- [ ] `app.neuvetra.com` loads the Front Desk dashboard
- [ ] `api.neuvetra.com/health` returns `{ status: "ok" }`
- [ ] Full signup + onboarding flow works in production
