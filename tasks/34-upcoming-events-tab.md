---
status: done
---
# Task 34: Upcoming Events Tab

## What was done
- New `CalendarAdapter.getUpcomingEvents(connection, from, to)` method added to interface + Google implementation
- Google adapter queries ALL calendar events (not just AI-booked) — removed `frontdesk_created=true` filter
- New `GET /businesses/:id/upcoming-events?days=7` endpoint
- New `UpcomingEventsTab.tsx` — events grouped by day, Today/Tomorrow labels, time column, indigo accent bar
- New sidebar tab "Upcoming Events" with CalendarDays icon, between Messages and Usage
- Disclaimer with clickable link to `https://calendar.google.com`
- Outlook adapter stub updated with `getUpcomingEvents` method
- 6 Playwright tests covering all states

## Key decisions
- Show ALL Google Calendar events (not just AI-booked) — one source of truth, user decides what's relevant
- Rejected "dedicated Front Desk calendar" approach — two sources of truth is wrong design
- 7-day window (not 14) — a week ahead is the practical planning horizon
- Grouped by day with "Today" highlighted in indigo, "Tomorrow", then full date names
- No-calendar state shows "Connect calendar" button linking to /dashboard/settings
