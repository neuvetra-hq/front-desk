---
status: pending
---

# Task 07: User Authentication (Frontend + Supabase)

## Auth Methods
Three supported methods, all handled by Supabase natively:
1. **Email + password** — standard
2. **Phone + OTP** — SMS via Twilio (already configured); user enters phone → receives OTP → enters code
3. **Google OAuth (SSO)** — one-click sign in with Google account

## Setup
- [ ] Install `@supabase/supabase-js` in `apps/web`
- [ ] Install `react-hook-form`, `zod`, `@hookform/resolvers` in `apps/web`
- [ ] Install shadcn components: `input`, `label`, `card`, `select`, `sonner`, `tabs`, `separator`
- [ ] Create `apps/web/.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Create `apps/web/.env` (not committed) with real values from Supabase dashboard
- [ ] Enable Phone provider in Supabase dashboard (Auth → Providers → Phone → Twilio)
- [ ] Enable Google provider in Supabase dashboard (Auth → Providers → Google → OAuth credentials)

## Supabase Client
- [ ] `src/lib/supabase.ts` — typed singleton Supabase client using `VITE_` env vars

## Auth Context
- [ ] `src/contexts/AuthContext.tsx` — provides `session`, `user`, `loading`, `signOut`
- [ ] `src/hooks/useAuth.ts` — convenience hook wrapping the context

## Database Trigger (packages/database)
- [ ] New migration: Postgres function + trigger on `auth.users` INSERT
      → auto-inserts into `public.users` (id, email, full_name, avatar_url, phone)
- [ ] Add `phone` column to `public.users` in schema (nullable text)
- [ ] Run `db:generate` + `db:migrate` to apply

## Components
- [ ] `src/components/auth/AuthLayout.tsx`
      — centered card layout, logo at top, used by both login + signup pages
- [ ] `src/components/auth/SocialAuth.tsx`
      — "Continue with Google" button (full width, Google icon, proper branding)
      — divider ("or continue with") below
- [ ] `src/components/auth/LoginForm.tsx`
      — tabs: "Email" | "Phone"
      — Email tab: email + password fields, show/hide toggle, zod validation
      — Phone tab: phone number input → OTP input (two-step within same form)
      — loading spinner, inline error messages
- [ ] `src/components/auth/SignupForm.tsx`
      — email, password, full name, phone number (optional),
        business name, business type (select from enum)
      — zod validation, loading spinner, inline error messages
- [ ] `src/components/auth/OtpInput.tsx`
      — 6-digit OTP input, auto-advance between digits, paste support
- [ ] `src/components/auth/ProtectedRoute.tsx`
      — wraps any route; redirects to `/login` if no active session

## Pages
- [ ] `src/pages/LoginPage.tsx` — AuthLayout + SocialAuth + LoginForm
- [ ] `src/pages/SignupPage.tsx` — AuthLayout + SocialAuth + SignupForm

## Post-Signup Flow
- [ ] After successful signup: create row in `businesses` + `business_members` (owner)
- [ ] Redirect authenticated users to `/dashboard` after sign in / sign up
- [ ] Redirect already-authenticated users away from `/login` and `/signup`
- [ ] Handle OAuth callback: Supabase redirects to `/auth/callback` → resolve session → redirect to `/dashboard`
- [ ] `src/pages/AuthCallbackPage.tsx` — handles the OAuth redirect URL

## Routing (App.tsx)
- [ ] Wrap `AuthProvider` around the entire app in `main.tsx`
- [ ] `/login` → `LoginPage`
- [ ] `/signup` → `SignupPage`
- [ ] `/auth/callback` → `AuthCallbackPage`
- [ ] `/dashboard` and other app routes → wrapped in `ProtectedRoute`

## UX Details
- [ ] Loading skeleton while session resolves on first load (avoids flash of login page)
- [ ] Toast notifications via `sonner`: success on sign in, error on failed attempts
- [ ] "Don't have an account? Sign up" link on login, and vice versa
- [ ] Password show/hide toggle
- [ ] Disable submit button while request is in flight
- [ ] Sign out button accessible from dashboard (placeholder for now)
- [ ] Google button matches Google brand guidelines (white bg, Google logo SVG, correct text)

## Supabase Dashboard Config (manual steps — documented here for reference)
- Enable Email provider (on by default)
- Enable Phone provider → set Twilio credentials (Account SID, Auth Token, From number)
- Enable Google provider → set Client ID + Secret from Google Cloud Console
- Set Site URL + Redirect URLs in Auth settings to include `http://localhost:5173`

## Acceptance Criteria
- New user can sign up with email/password → all DB rows created
- User can sign in via Google SSO → session established, redirected to `/dashboard`
- User can sign in via phone OTP → OTP received via SMS, session established
- Wrong credentials → clear error message, no crash
- Unauthenticated access to `/dashboard` → redirected to `/login`
- Already signed-in user visiting `/login` → redirected to `/dashboard`
- Session survives page refresh
- Sign out clears session and redirects to `/login`
- All forms validated client-side with zod before submission
- `public.users` row auto-created via trigger for all auth methods (email, phone, Google)
- UI is polished: shadcn Card, Input, Button, Select, Tabs, Sonner toasts
- No console errors
