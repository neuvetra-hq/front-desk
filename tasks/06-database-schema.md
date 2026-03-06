---
status: done
---

# Task 06: Database Schema & Migrations (`packages/database`)

## Schema
- [x] Define enums: `business_status`, `business_type`, `member_role`, `call_status`
- [x] Table: `businesses` (replaces `tenants`) — with status + business_type enums
- [x] Table: `users` — mirrors Supabase `auth.users.id`
- [x] Table: `business_members` — join table with role enum
- [x] Table: `knowledge_base` — FK updated to `businesses`
- [x] Table: `calls` — FK updated + summary, duration_seconds, retell_call_id added

## Migration Setup
- [x] Add `src/migrate.ts` — programmatic migration runner (drizzle migrator)
- [x] Add `db:migrate` script to `package.json`
- [x] Update `db:generate` + `db:migrate` scripts to load env from `apps/api/.env`
- [x] Run `db:generate` → produce first migration in `migrations/`
- [x] Run `db:migrate` → apply migration to Supabase

## Conventions
- All enums defined with `pgEnum` (Postgres native enums, not text)
- `updatedAt` on mutable tables (`businesses`, `users`)
- `createdAt` on all tables
- All FKs use `onDelete: "cascade"`
- Migration files committed to git — `db:push` is for local dev only

## Acceptance Criteria
- `bun run db:generate` produces a clean SQL migration file
- `bun run db:migrate` applies it to Supabase without errors
- All 5 tables + 4 enums visible in Supabase dashboard
