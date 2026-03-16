---
status: done
---

# Task 08: Business Onboarding Flow (`apps/web`)

Runs after signup. Collects business details before the user reaches the dashboard.
Triggered when `businesses.status = "inactive"` and no `business_type` set.

## Flow
```
Sign up → /onboarding → fill in business details → /dashboard
```

## Components
- [ ] `src/pages/OnboardingPage.tsx` — full-page stepper, protected route
- [ ] `src/components/onboarding/StepBusinessInfo.tsx`
      — business name, business type (select), area code preference for phone number
- [ ] `src/components/onboarding/StepConfirm.tsx`
      — summary of entered info, "Activate my Front Desk" CTA
      — for MVP: triggers provision immediately (no payment step)

## Logic
- [ ] On submit: PATCH /api/businesses/:id with name, businessType, areaCode
- [ ] On "Activate": POST /api/businesses/:id/provision (Task 09)
- [ ] On success: redirect to /dashboard

## Routing
- [ ] Add `/onboarding` route (protected)
- [ ] After sign in/sign up: check if business is inactive → redirect to /onboarding
- [ ] After onboarding complete → redirect to /dashboard

## Acceptance Criteria
- New user is automatically redirected to onboarding after signup
- Business name + type saved to DB
- Area code preference stored and used for Twilio number search
- User lands on dashboard with status = active and twilio_number assigned
