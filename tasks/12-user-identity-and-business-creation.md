---
status: todo
---

# Task 12: User Identity First, Then Business Creation

Restructure the entire signup + onboarding flow so that a verified user identity
is established before any business is created. Supports multiple businesses per user in the future.

## The Problem with the Current Flow
- A placeholder business is created at signup before we know anything about the user
- The user has no verified phone number stored in the DB
- Business creation is tangled with auth — hard to add a second business later
- `users` table has `full_name` but we never properly collect first + last name

## The New Flow

```
Step 1 — Who are you?        → collect first name, last name, personal cell number
Step 2 — Verify your number  → SMS OTP sent to their cell → enter code → user verified
Step 3 — Your business       → business name, business type
Step 4 — Pick your AI number → fetch Twilio numbers matching their area code → user picks one
Done   → business created, user linked, redirect to /dashboard
```

## Database Changes (`packages/database/src/schema.ts`)

### users table
- [ ] Split `full_name` into `first_name` + `last_name` (or keep full_name and add both — prefer split)
- [ ] Add `phone` column (text, nullable) — stores verified personal phone
- [ ] Remove any auto-created placeholder logic

### businesses table
- No schema changes needed — already has twilioNumber, twilioNumberSid, status, businessType

### businessMembers table
- No changes — already links userId → businessId with role

## Auth / Session Changes

- [ ] Supabase phone OTP is the only auth method — no email/password, no Google OAuth
- [ ] After `verifyOtp` succeeds → check if `public.users` row exists
  - If NO → new user → go to Step 3 (collect identity details, then business)
  - If YES → returning user → go to /dashboard
- [ ] Remove all placeholder business creation from auth flow (currently in SignupForm + LoginPage)

## New Pages / Components

### Replace current LoginPage + OnboardingPage with a single unified wizard

**`/signup` — UnifiedSignupPage** (new, 4 steps)
- Step 1: `StepIdentity` — first name, last name, personal cell number
- Step 2: `StepVerify` — enter SMS OTP, resend option, back to step 1
- Step 3: `StepBusiness` — business name, business type
- Step 4: `StepPickNumber` — show 3–5 available Twilio numbers in their area code, user picks one → provision → done

**`/login` — LoginPage** (simplified, returning users only)
- Just phone number → OTP → redirect to /dashboard
- Link to /signup for new users

### Delete / retire
- [ ] `SignupPage.tsx` (currently just redirects)
- [ ] `OnboardingPage.tsx` — replaced by UnifiedSignupPage
- [ ] `StepBusinessInfo.tsx` — replaced by StepBusiness + StepPickNumber
- [ ] `StepConfirm.tsx` — replaced by StepPickNumber

## API Changes (`apps/api/src/routes/businesses.ts`)

- [ ] `GET /businesses/:id/available-numbers` already works — reuse as-is
- [ ] `POST /businesses/:id/provision` already works — but now called with user-selected number, not first available
- [ ] `POST /businesses` — NEW endpoint to create a business for a user
  - Body: `{ name, businessType, userId }`
  - Creates business row + business_members row in one transaction
  - Returns `{ businessId }`

## Frontend Logic

### StepPickNumber
- On mount: extract area code from personal phone number collected in Step 1
- Call `GET /businesses/available-numbers?areaCode={code}` (temp business or public endpoint)
- Show list of 3–5 numbers with locality/region info, user clicks to select
- On confirm:
  1. `POST /businesses` → create business → get businessId
  2. `POST /businesses/:id/provision` with selected number
  3. `refreshBusiness()` → redirect to /dashboard

### ProtectedRoute
- [ ] Update logic: a user with a verified `public.users` row but no active business → redirect to /signup (step 3)
- [ ] A user with no `public.users` row → redirect to /signup (step 1)
- [ ] A user with active business → /dashboard

## App Router (`App.tsx`)
- [ ] `/signup` → UnifiedSignupPage (public)
- [ ] `/login` → LoginPage (public, returning users)
- [ ] `/dashboard` → DashboardPage (protected)
- [ ] Remove `/onboarding` route

## Acceptance Criteria
- New user goes through all 4 steps before any business is created
- User's first name, last name, and verified phone are saved to `public.users`
- User manually picks their AI phone number from real available options
- Returning user logs in with phone → OTP → straight to dashboard
- A user can theoretically repeat step 3–4 to add a second business (foundation laid)
- No placeholder business rows ever created
