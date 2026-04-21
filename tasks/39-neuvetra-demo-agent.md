---
status: in-progress
---
# Task 39: Neuvetra Demo Agent

## What we're building
A dedicated Retell AI agent for Neuvetra's own contact number (+16508308181).
- Agent name: "Aria" — Neuvetra's AI receptionist
- Static knowledge of Front Desk (no business KB/calendar API calls)
- Single function: `capture_lead` → POST /neuvetra/lead → SMS to Nima
- Deployed via `apps/api/scripts/deploy-neuvetra-agent.ts`
- Wired to +16508308181 via Retell dashboard + Twilio Voice URL

## Key decisions
- No businessId in DB — Neuvetra isn't a customer account, it's the company itself
- No calendar integration — lead capture only (SMS notification to Nima)
- Separate webhook endpoint `/neuvetra/webhook` for call events (lightweight, no DB write)
- Separate deploy script so it doesn't interfere with customer agent deploys

## New env vars needed
- `NEUVETRA_AGENT_ID` — set after running deploy script
- `NEUVETRA_NOTIFY_PHONE` — Nima's personal cell for SMS lead notifications
