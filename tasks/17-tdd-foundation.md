---
status: in-progress
---

# Task 17: TDD Foundation — Playwright E2E Tests

Establish a test-driven development (TDD) foundation with Playwright for critical user flows.
Tests live in `apps/web/tests/` and run against the production or local dev server.

## Goals

- Install and configure Playwright in `apps/web`
- Cover the critical signup/login/onboarding/protected-route flows
- Integrate test run into CI (Railway build passes tests before deploy)
- Document TDD conventions in CLAUDE.md

## Test Scenarios (MVP)

### Auth flows
- [ ] Landing page loads, hero CTA links to /signup
- [ ] /signup — phone number entry form renders
- [ ] /signup — OTP step renders after phone submit
- [ ] /login — redirects authenticated user to /dashboard
- [ ] Protected route /dashboard — unauthenticated user redirected to /login

### Onboarding flow
- [ ] /onboarding/identity — first name, last name, email fields present
- [ ] /onboarding/business — business name and type fields present
- [ ] /onboarding/number — phone number selection step renders

### Landing page
- [ ] All nav links present (Products, How It Works, Industries, Pricing)
- [ ] Products section shows "Neuvetra Front Desk" card
- [ ] Footer has Privacy Policy and Terms of Service links

## Setup Steps

1. `cd apps/web && bunx playwright install --with-deps chromium`
2. Create `apps/web/playwright.config.ts`
3. Write tests in `apps/web/tests/`
4. Add `"test:e2e": "playwright test"` script to apps/web/package.json
5. Update CLAUDE.md with TDD conventions

## Done When

- `bun run test:e2e` passes from `apps/web/`
- At least 10 test cases covering auth + landing
- CLAUDE.md updated with TDD section
