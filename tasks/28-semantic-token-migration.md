---
status: done
---

# Task 28: Semantic Token Migration (Dashboard)

## What was done
Replaced all hardcoded neutral color tokens across the dashboard with shadcn CSS variables so every panel, card, and text element adapts to dark mode and future theme changes.

### Files updated
- `apps/web/src/pages/DashboardPage.tsx`
- `apps/web/src/components/dashboard/AppSidebar.tsx`
- `apps/web/src/components/dashboard/CallLogsTab.tsx`
- `apps/web/src/components/dashboard/UsageTab.tsx`
- `apps/web/src/components/dashboard/KnowledgeBaseTab.tsx`
- `apps/web/src/components/dashboard/SettingsTab.tsx`

### Token replacements
- `bg-white` (cards/panels) → `bg-card`
- `border-neutral-*` → `border-border`
- `text-neutral-900/800/700` → `text-foreground`
- `text-neutral-600/500/400/300` → `text-muted-foreground`
- `bg-neutral-100` → `bg-muted`
- `bg-neutral-50` / `hover:bg-neutral-50` → `bg-muted/50` / `hover:bg-muted/50`
- `divide-neutral-100` → `divide-border`
- `bg-neutral-900` (sidebar logo) → `bg-sidebar-primary`
- Indigo highlight boxes → added `dark:` variants (`dark:bg-indigo-950/40`, `dark:border-indigo-800/50`, `dark:text-indigo-100/300/200`)

## Key decisions
- Status/accent colors (`text-green-*`, `text-amber-*`, `text-indigo-*`) left as-is — intentional semantic colors
- Indigo info boxes use `dark:` prefix variants rather than replacing with neutral tokens, preserving the branded highlight appearance in both modes
