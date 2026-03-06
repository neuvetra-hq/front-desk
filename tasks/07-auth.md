---
status: in-progress
---

# Task 07: User Authentication (Frontend + Supabase)

## Auth Methods
1. **Email + password**
2. **Google OAuth (SSO)**
> Phone OTP deferred — phone number is collected as profile data at signup, not used as auth method

## Setup
- [ ] Install `@supabase/supabase-js` in `apps/web`
- [ ] Install `react-hook-form`, `zod`, `@hookform/resolvers` in `apps/web`
- [ ] Install shadcn components: `input`, `label`, `card`, `select`, `sonner`, `separator`
- [ ] Create `apps/web/.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Create `apps/web/.env` (not committed) with real values from Supabase dashboard
- [ ] Enable Google provider in Supabase dashboard (Auth → Providers → Google)

## Supabase Client
- [ ] `src/lib/supabase.ts` — typed singleton client using `VITE_` env vars

## Auth Context
- [ ] `src/contexts/AuthContext.tsx` — provides `session`, `user`, `loading`, `signOut`
- [ ] `src/hooks/useAuth.ts` — convenience hook

## Database Trigger (packages/database)
- [ ] Add `phone` column to `public.users` schema (nullable text)
- [ ] New migration: Postgres function + trigger on `auth.users` INSERT
      → auto-inserts into `public.users` (id, email, full_name, avatar_url, phone)
- [ ] Run `db:generate` + `db:migrate`

## Components
- [ ] `src/components/auth/AuthLayout.tsx` — centered card, logo at top
- [ ] `src/components/auth/SocialAuth.tsx` — "Continue with Google" button + divider
- [ ] `src/components/auth/LoginForm.tsx` — email + password, show/hide toggle, zod, errors
- [ ] `src/components/auth/SignupForm.tsx`
      — full name, personal phone number, email, password
      — zod validation, inline errors, loading state
- [ ] `src/components/auth/ProtectedRoute.tsx` — redirect to /login if no session

## Pages
- [ ] `src/pages/LoginPage.tsx`
- [ ] `src/pages/SignupPage.tsx`
- [ ] `src/pages/AuthCallbackPage.tsx` — handles Google OAuth redirect → /dashboard

## Post-Auth Flow
- [ ] Signup: create `businesses` row (name = "{fullName}'s Business", status = inactive) +
      `business_members` row (role = owner) after user row exists
- [ ] Redirect to `/dashboard` after sign in / sign up
- [ ] Redirect away from `/login` + `/signup` if already authenticated

## Routing
- [ ] Wrap `AuthProvider` in `main.tsx`
- [ ] `/login` → LoginPage
- [ ] `/signup` → SignupPage
- [ ] `/auth/callback` → AuthCallbackPage
- [ ] `/dashboard` → wrapped in ProtectedRoute (placeholder page for now)

## UX
- [ ] Full-page loading state while session resolves (no flash of wrong page)
- [ ] Sonner toasts: success on sign in, error on failure
- [ ] Disable submit + show spinner while in flight
- [ ] "Already have an account? Sign in" ↔ "Don't have an account? Sign up" links
- [ ] Password show/hide toggle

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
