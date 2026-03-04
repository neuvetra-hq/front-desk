# Front Desk — Birgani Enterprises Inc.

## What This Is
AI-powered voice front desk for General Contractors (MVP).
Catches missed calls, answers FAQs, books appointments, escalates to owner.

## Stack
- Monorepo: Turborepo + pnpm workspaces
- API: Hono.js (Node 20, TypeScript strict)
- Web: Next.js 14 App Router + TailwindCSS
- Mobile: Expo + NativeWind
- DB/Auth: Supabase (Postgres + RLS + Auth)
- Voice: Retell AI + Twilio
- Calendar: Google Calendar (primary), Cal.com (secondary)
- Background jobs: Inngest (not yet wired)

## Commands
- pnpm dev         → start all apps
- pnpm build       → build all apps
- pnpm lint        → lint all
- pnpm typecheck   → tsc --noEmit all

Run a single app:

```bash
pnpm --filter @front-desk/api dev
pnpm --filter @front-desk/web dev
pnpm --filter @front-desk/mobile dev
```

## Critical Path (latency target: <200ms)
Retell webhook → apps/api/src/routes/retell.routes.ts
→ validate signature → parse event → respond 200
→ heavy work (DB writes, calendar calls) goes to Inngest jobs

## Architecture Rules
- NEVER put business logic in packages/shared (types + Zod schemas only)
- NEVER import from apps/* into packages/shared
- ALL Supabase DB access uses service-role key server-side only
- ALL tables have RLS enabled — tenant isolation is non-negotiable
- Calendar logic always goes through lib/calendar/factory.ts adapter
- Retell webhook MUST return 200 even on errors (log, never throw)

## Schema
7 tables: tenants, tenant_users, customers, calls,
          appointments, callbacks, webhook_events
Customers deduplicated by (tenant_id, phone).
calls.customer_id is nullable for first-time callers.

## Code Standards
- TypeScript strict mode everywhere — no `any`, ever
- Zod for all runtime validation at system boundaries
- No `console.log` in production paths — use a structured logger
- ESLint enforced across all packages

## Workspace Package Names
| App / Package | Package name          |
| ------------- | --------------------- |
| Web           | `@front-desk/web`     |
| Mobile        | `@front-desk/mobile`  |
| API           | `@front-desk/api`     |
| Shared types  | `@front-desk/shared`  |
