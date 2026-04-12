---
status: done
---

# Task 24: Dashboard Tab URL Routing

## Problem

All dashboard tabs (Overview, Call Logs, Messages, Usage, Knowledge Base, Settings)
were driven by a single `useState` value. Switching tabs changed no URL, so:
- Bookmarks always land on Overview regardless of what the user was viewing
- Sharing a link to a specific tab was impossible
- Browser back/forward didn't work between tabs

## Solution

Replace `useState<Tab>` with React Router's `useParams` + `useNavigate`.

- Route: `/dashboard/:tab` — each tab has its own URL
- `/dashboard` redirects to `/dashboard/overview`
- Unknown `:tab` values redirect to `/dashboard/overview`
- Tab buttons call `navigate("/dashboard/:tab")` — browser history works

## URL map

| Tab | Path |
|-----|------|
| Overview | `/dashboard/overview` |
| Call Logs | `/dashboard/calls` |
| Messages | `/dashboard/messages` |
| Usage | `/dashboard/usage` |
| Knowledge Base | `/dashboard/knowledge` |
| Settings | `/dashboard/settings` |

## Checklist

- [x] `App.tsx` — add `/dashboard/:tab` route + redirect from `/dashboard`
- [x] `DashboardPage.tsx` — replace `useState` with `useParams` + `useNavigate`
- [x] Unknown tab params redirect to overview
- [x] No-calendar banner "Connect calendar →" navigates to `/dashboard/settings`
- [x] Tests written and passing
