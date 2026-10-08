---
status: done
---

# Task 01: Monorepo Foundation (Turborepo + Bun)

- [x] Create `turbo.json` with dev/build/typecheck pipelines
- [x] Update root `package.json` as workspace root (remove single-app deps)
- [x] Create `packages/config` with shared `tsconfig.base.json`
- [x] Create `package.json` for `apps/api`, `apps/web`, `packages/database`
- [x] Remove root `src/` (source moves to `apps/api`)
- [x] Update the README to reflect monorepo layout

## Acceptance Criteria
- `bun install` links all workspaces
- `bun run dev` from root starts all apps via turbo
