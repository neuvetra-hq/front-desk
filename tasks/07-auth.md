---
status: done
---

# Task 07: User Authentication (Frontend + Supabase)

## Auth Methods
1. **Email + password**
2. **Google OAuth (SSO)**
> Phone OTP deferred — phone number is collected as profile data at signup, not used as auth method

## Setup
- [x] Install `@supabase/supabase-js` in `apps/web`
- [x] Install `react-hook-form`, `zod`, `@hookform/resolvers` in `apps/web`
- [x] Install shadcn components: `input`, `label`, `card`, `select`, `sonner`, `separator`
- [x] Create `apps/web/.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [x] Create `apps/web/.env` (not committed) with real values from Supabase dashboard
- [x] Enable Google provider in Supabase dashboard (Auth → Providers → Google)

## Supabase Client
- [x] `src/lib/supabase.ts` — typed singleton client using `VITE_` env vars

## Auth Context
- [x] `src/contexts/AuthContext.tsx` — provides `session`, `user`, `loading`, `signOut`
- [x] `src/hooks/useAuth.ts` — convenience hook

## Database Trigger (packages/database)
- [x] Add `phone` column to `public.users` schema (nullable text)
- [x] New migration: Postgres function + trigger on `auth.users` INSERT
      → auto-inserts into `public.users` (id, email, full_name, avatar_url, phone)
- [x] Run `db:generate` + `db:migrate`

## Components
- [x] `src/components/auth/AuthLayout.tsx` — centered card, logo at top
- [x] `src/components/auth/SocialAuth.tsx` — "Continue with Google" button + divider
- [x] `src/components/auth/LoginForm.tsx` — email + password, show/hide toggle, zod, errors
- [x] `src/components/auth/SignupForm.tsx`
      — full name, personal phone number, email, password
      — zod validation, inline errors, loading state
- [x] `src/components/auth/ProtectedRoute.tsx` — redirect to /login if no session

## Pages
- [x] `src/pages/LoginPage.tsx`
- [x] `src/pages/SignupPage.tsx`
- [x] `src/pages/AuthCallbackPage.tsx` — handles Google OAuth redirect → /dashboard

## Post-Auth Flow
- [x] Signup: create `businesses` row (name = "{fullName}'s Business", status = inactive) +
      `business_members` row (role = owner) after user row exists
- [x] Redirect to `/dashboard` after sign in / sign up
- [x] Redirect away from `/login` + `/signup` if already authenticated

## Routing
- [x] Wrap `AuthProvider` in `main.tsx`
- [x] `/login` → LoginPage
- [x] `/signup` → SignupPage
- [x] `/auth/callback` → AuthCallbackPage
- [x] `/dashboard` → wrapped in ProtectedRoute (placeholder page for now)

## UX
- [x] Full-page loading state while session resolves (no flash of wrong page)
- [x] Sonner toasts: success on sign in, error on failure
- [x] Disable submit + show spinner while in flight
- [x] "Already have an account? Sign in" ↔ "Don't have an account? Sign up" links
- [x] Password show/hide toggle

## Acceptance Criteria
- User signs up (name + phone + email + password) → auth.users + public.users + businesses + business_members rows all created
- User signs in with Google → session established, redirected to /dashboard
- Wrong credentials → clear error shown
- Unauthenticated /dashboard → redirected to /login
- Authenticated user on /login → redirected to /dashboard
- Session survives page refresh
- Sign out works, redirects to /login
- All forms zod-validated before submission
- UI polished: shadcn components, toasts, loading states
- No console errors
