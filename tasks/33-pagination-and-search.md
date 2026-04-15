---
status: done
---
# Task 33: Pagination & Search for Call Logs and Messages

## What was done
- Backend: `/businesses/:id/calls` and `/businesses/:id/messages` now accept `limit`, `offset`, `search` params; return `{ total, hasMore }`
- Frontend: "Load more" button pattern (append, not replace), page size 20
- Debounced search (400ms) by phone number for calls; by phone or name for messages
- Separate `searching` state — table fades to 50% opacity during search, input never loses focus
- Spinner replaces search icon while debounce/request is in-flight
- Tests: full Playwright coverage for load-more, search, clear search

## Key decisions
- "Load more" preferred over infinite scroll (simpler, no intersection observer) and page numbers (no jumping)
- `searching` state separate from `loading` — prevents skeleton from unmounting input and losing focus
- Count query runs in parallel with data query via `Promise.all` — no extra latency
- Backend uses Drizzle `ilike` for case-insensitive phone/name search
