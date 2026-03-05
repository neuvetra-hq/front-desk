# Front Desk — Claude Instructions

## Project Overview
AI voice front-desk application. Turborepo monorepo with Bun.

## Stack
- **Runtime:** Bun
- **API Framework:** Elysia (`apps/api`)
- **Frontend:** Vite + React + TailwindCSS v4 + React Router v7 (`apps/web`)
- **ORM:** Drizzle ORM + drizzle-kit
- **Database:** Supabase (PostgreSQL + Auth)
- **Language:** TypeScript

## Workspace Structure
```
apps/api      — Bun + Elysia backend, port 3000
apps/web      — Vite + React SPA
packages/database  — Drizzle ORM schema + client (shared)
packages/config    — Shared TypeScript configs
```

## Dev Commands
```bash
bun run dev                              # all apps via turbo
cd apps/api && bun run dev               # API only (port 3000)
cd apps/web && bun run dev               # Web only (Vite dev server)
cd packages/database && bun run db:generate   # generate SQL migrations
cd packages/database && bun run db:push       # push schema to Supabase
```

## Key Conventions
- Entry point: `apps/api/src/index.ts`
- Always use Bun APIs over Node.js (`Bun.file`, `Bun.env`)
- Use Elysia's built-in type system — no separate validation library
- Route definitions in `apps/api/src/routes/`
- Database schemas in `packages/database/src/schema.ts`
- Eden type export: `export type App = typeof app` from `apps/api/src/index.ts`

## Package Management
- Use `bun add` / `bun remove` — do NOT use npm or pnpm
- Run from the workspace directory: `cd apps/api && bun add <pkg>`
- Lock file: `bun.lock` at root
