---
status: done
---

# Task 02: Database Package (`packages/database`)

- [x] Create Drizzle schema: `tenants`, `knowledge_base`, `calls` tables
- [x] Create Drizzle client using `postgres` driver (Supabase PostgreSQL)
- [x] Create `drizzle.config.ts`
- [x] Create `.env.example`

## Schema Design
- **tenants**: id, name, twilio_number, owner_phone, ai_template (jsonb), calcom_api_key
- **knowledge_base**: id, tenant_id (FK), question, answer
- **calls**: id, tenant_id (FK), caller_number, status, started_at, ended_at, transcript, recording_url

## Acceptance Criteria
- `bun run db:generate` produces SQL migration files
- Package is importable from `apps/api` via `@frontdesk/database`
