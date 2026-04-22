---
status: done
---
# Task 41: App Loader

## What was done
- Fixed white flash: added `background: #0b0c0d` to `<html>` in index.html
- Added `loading` initial state to `view` in the XState machine
- `SPIRIT_READY` event transitions `view.loading` → correct page based on `context.currentRoute`
- `ROUTE_CHANGED` in `loading` stores route but does not transition view
- Added `onReady` callback to `useSpirit` — fires when `engine.init()` resolves (Three.js + audio buffered)
- Added dark fullscreen overlay in `AppLayout` with Framer Motion fade-out on SPIRIT_READY

## Key decisions
- Loading state lives in `view` (not a new parallel dimension) — loading screen is a first-class view
- `onReady` is called after `engine.init()` which awaits ALL audio buffers — true "everything loaded" signal
- Overlay uses `z-[200]` to sit above all other layers including nav and page content
- Loader text is placeholder — visual design intentionally deferred
