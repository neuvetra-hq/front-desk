---
status: done
---
# Task 32: Logo & Branding

## What was done
- Replaced old "FD" dark badge with transparent PNG logo across the app
- Logo file: `apps/web/public/logo-v2.png` (cache-busted from logo.png)
- Updated: `AuthLayout.tsx`, `AppSidebar.tsx`, `Navbar.tsx`, `index.html` (favicon + OG/Twitter meta)

## Key decisions
- Renamed to `logo-v2.png` to bust browser cache (Vite doesn't hash files in `public/`)
- Removed indigo wrapper background after user provided clean transparent PNG
- AuthLayout previously used `<div bg-neutral-900><span>FD</span></div>` — replaced with `<img>`
