---
status: done
---

# Task 46: Update E2E tests with new copy assertions for How It Works page redesign

## What was done

Updated `apps/web/tests/app-how-it-works.spec.ts` with new copy assertions to match the redesigned How It Works page:

1. **Descriptor test** (line 14): Changed from `/live in under 10 minutes/i` → `/your ai\. ready in minutes\./i`
2. **Step titles tests** (lines 20-23): Replaced 4 old step titles with new ones:
   - "Create your account" → "Start with your phone number"
   - "Tell us about your business" → "Design your AI"
   - "Set up call forwarding" → "Pick your AI's number"
   - "Go live" → "Call it. Then let it work."
3. **Bottom nav test** (line 35): Updated presence check to use new first step title
4. **Callout visibility test** (new, line 26-30): Added test for "7-day free trial" callout on step 01
5. **Home page test**: Confirmed unchanged — still correctly asserts old descriptor text is NOT on /app

## Test results

All 4 modified/new tests **fail as expected** (TDD-first approach):
- "shows descriptor line" - FAIL (text not found yet)
- "shows all 4 step titles" - FAIL (text not found yet)
- "shows callout line for step 01" - FAIL (text not found yet)
- "bottom nav is visible with content present" - FAIL (text not found yet)

8 other tests pass (including navigation tests and Home page unchanged test).

## Key decisions

- Tests were designed to fail first per TDD protocol — implementation (landing.ts data + AppHowItWorksPage.tsx) comes in next tasks
- New callout test validates the "7-day free trial" messaging visible on step 01
- Home page test remains unchanged and passes, confirming old descriptor removed from /app

## Files changed

- `apps/web/tests/app-how-it-works.spec.ts` — committed as d48cf73
