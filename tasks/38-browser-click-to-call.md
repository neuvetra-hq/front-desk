---
status: done
---
# Task 38: Browser Click-to-Call on Landing Page

## Goal
Add a "Call Us" button to the landing page that lets visitors call the Neuvetra demo number directly from their browser (no phone needed) using WebRTC via Twilio Voice JS SDK. The call routes into the existing Retell AI receptionist — zero changes needed on the Retell side.

## Phone Number
- **TODO:** User to provide the Neuvetra number to display and dial

## Architecture

```
Landing page "Call Us" button
  → fetch /voice-token (public API endpoint)
  → Twilio Voice JS SDK opens WebRTC connection
  → Twilio routes call to Neuvetra number
  → Retell AI answers as normal
```

## Manual Twilio Setup (required before coding)
- [ ] Create a **TwiML App** in Twilio Console
  - Voice Request URL: `https://api.neuvetra.com/voice/outbound` (POST)
  - Copy the resulting **TwiML App SID** (starts with `AP...`)
- [ ] Create a **Twilio API Key** (Standard type) in Twilio Console
  - Copy **API Key SID** (starts with `SK...`) and **API Secret**
- [ ] Add env vars to Railway API service:
  - `TWILIO_TWIML_APP_SID=AP...`
  - `TWILIO_API_KEY_SID=SK...`
  - `TWILIO_API_SECRET=...`
  - `TWILIO_PHONE_NUMBER` — already in `.env.local`, just make sure it's set in Railway too

## Implementation Plan

### Step 1 — API: TwiML outbound webhook
New route: `POST /voice/outbound`
- Public (no auth)
- Returns TwiML `<Dial>` to the Neuvetra number
- Twilio calls this when the browser initiates an outbound call

```ts
// apps/api/src/routes/voice.ts
app.post('/voice/outbound', () => {
  const twiml = new VoiceResponse()
  twiml.dial().number(Bun.env.TWILIO_PHONE_NUMBER!)
  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  })
})
```

### Step 2 — API: Access token endpoint
New route: `GET /voice-token`
- Public (no auth needed — token is scoped and short-lived)
- Mints a Twilio Access Token with Voice Grant
- TTL: 3600s (1 hour)

```ts
// in apps/api/src/routes/voice.ts
app.get('/voice-token', () => {
  const token = new twilio.jwt.AccessToken(
    Bun.env.TWILIO_ACCOUNT_SID!,
    Bun.env.TWILIO_API_KEY_SID!,
    Bun.env.TWILIO_API_SECRET!,
    { ttl: 3600 }
  )
  token.addGrant(new VoiceGrant({
    outgoingApplicationSid: Bun.env.TWILIO_TWIML_APP_SID!
  }))
  return { token: token.toJwt() }
})
```

### Step 3 — Frontend: useVoiceCall hook
`apps/web/src/hooks/useVoiceCall.ts`

States: `idle | requesting-mic | connecting | in-call | ended | error`

Responsibilities:
- Fetch token from API
- Init `Device` from `@twilio/voice-sdk`
- `connect()` to start call, `disconnect()` to hang up
- Expose: `{ status, start, hangUp, isMuted, toggleMute }`

### Step 4 — Frontend: CallButton component
`apps/web/src/components/landing/CallButton.tsx`

UI states:
- **Idle:** "Call Us Free" button with phone icon + the Neuvetra number shown below it
- **Connecting:** spinner + "Connecting…"
- **In-call:** pulsing green indicator + call timer + Mute + Hang Up buttons
- **Error:** friendly message ("Microphone access denied" / "Could not connect")

Design: prominent, fits landing page aesthetic. Not a dialog — inline in the hero or CTA section.

### Step 5 — Landing page integration
- Add `<CallButton />` to the landing page hero or a dedicated "Try it now" CTA section
- Show the Neuvetra number as text beneath the button (clickable as `tel:` link on mobile as fallback)
- Brief copy: "Talk to our AI receptionist live — no signup needed"

## Package
```bash
cd apps/web && bun add @twilio/voice-sdk
```
(No new API package needed — `twilio` already installed in apps/api)

## Edge Cases to Handle
- **Mic denied:** Catch `getUserMedia` error, show clear message
- **Already in call:** Disable button while call is active
- **Token expiry:** Re-fetch token if Device reports expired (unlikely in 1hr window)
- **Mobile browsers:** WebRTC works on iOS Safari 15+ and Android Chrome — show `tel:` fallback link too
- **Multiple tabs:** Each tab gets its own Device instance; fine for a demo number

## Testing
- Playwright test: clicking "Call Us" button shows connecting state (mock the SDK)
- Manual: call from browser, Retell AI should answer with the configured greeting

## Key Decisions
- No auth required — this is a public demo feature on the landing page
- Token endpoint is public but safe — tokens are scoped to outbound only, short-lived
- No recording or logging of these calls needed (they're demo calls)
- `tel:` link as mobile fallback so the number is always accessible
