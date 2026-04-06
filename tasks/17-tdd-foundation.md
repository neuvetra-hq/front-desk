---
status: done
---

# Task 17: TDD Foundation — Playwright E2E Tests

Establish a test-driven development (TDD) foundation with Playwright for critical user flows.
Tests live in `apps/web/tests/` and run against the production or local dev server.

## Goals

- [x] Install and configure Playwright in `apps/web`
- [x] Cover the critical signup/login/onboarding/protected-route flows
- [x] Integrate test run into CI (Railway build passes tests before deploy)
- [x] Document TDD conventions in CLAUDE.md

## Test Scenarios (MVP)

### Auth flows
- [x] Landing page loads, hero CTA links to /signup
- [x] /signup — phone number entry form renders (step 0: first name, last name, phone)
- [x] /signup — OTP step renders after phone submit
- [x] /login — renders login form (authenticated redirect requires storageState — deferred)
- [x] Protected route /dashboard — unauthenticated user redirected to /login

### Signup wizard (replaces old /onboarding/identity, /onboarding/business routes)
- [x] /signup step 0 — first name, last name, mobile fields present
- [x] /signup — 4-step progress indicator renders
- [x] /signup — Send verification code button present
- [x] /onboarding redirects to /signup

### Landing page
- [x] All nav links present (Products, How It Works, Industries, Pricing)
- [x] Products section shows "Neuvetra Front Desk" card
- [x] Footer has Privacy Policy and Terms of Service links
- [x] Industries section present

### Pricing
- [x] #pricing section exists
- [x] All three tiers (Starter, Growth, Pro) visible
- [x] Correct monthly prices ($49, $99, $199)
- [x] Growth tier has "most popular" badge
- [x] Free trial text visible
- [x] Annual toggle switches to discounted prices ($39, $79, $159)
- [x] Overage rate text visible

### Legal pages
- [x] /terms renders Terms of Service heading
- [x] /privacy renders Privacy Policy heading

## Done When

- [x] `bun run test:e2e` passes from `apps/web/` — **24 tests, all passing**
- [x] At least 10 test cases covering auth + landing
- [x] CLAUDE.md updated with TDD section

## Notes
- Authenticated-state tests (login redirect, post-OTP steps) require Playwright `storageState` with a seeded Supabase session — deferred to a future task
- `/onboarding` route redirects to `/signup` — old sub-routes `/onboarding/identity` etc. were removed; signup wizard is a single 4-step page at `/signup`
