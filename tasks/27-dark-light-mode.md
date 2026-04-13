---
status: done
---

# Task 27: Dark / Light Mode Theme Toggle

## What was done
- Created `apps/web/src/contexts/ThemeContext.tsx` — React context with `ThemeProvider` + `useTheme()` hook, localStorage persistence, toggles `.dark` class on `document.documentElement`
- Updated `apps/web/src/main.tsx` — wrapped app with `<ThemeProvider>` inside BrowserRouter, outside AuthProvider
- Updated `apps/web/src/pages/DashboardPage.tsx` — added `ThemeToggle` component (Sun/Moon icons from lucide-react) pinned to top-right of dashboard header
- Fixed `apps/web/src/components/ui/sonner.tsx` — replaced `useTheme` from `next-themes` with `useTheme` from `@/contexts/ThemeContext` so toasts respect the selected theme

## Key decisions
- Theme stored in `localStorage` under key `"theme"`, defaults to `"light"`
- Tailwind v4 dark mode via `.dark` class on `<html>` — all CSS variable overrides were already defined in `index.css`
- Toggle is dashboard-only for now (login/signup pages always use light mode)
