import { Elysia, t } from "elysia"
import { createClient } from "@supabase/supabase-js"
import { db, calendarConnections, businesses, businessMembers } from "@frontdesk/database"
import { eq, and } from "drizzle-orm"

const GOOGLE_AUTH_URL     = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL    = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

const WEB_URL = Bun.env.WEB_URL ?? "https://neuvetra.com"

const supabase = createClient(
  Bun.env.SUPABASE_URL!,
  Bun.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ---------------------------------------------------------------------------
// Auth helper — validates Bearer JWT, returns user id or null
// ---------------------------------------------------------------------------

async function getUserId(headers: Record<string, string | undefined>): Promise<string | null> {
  const token = headers["authorization"]?.slice(7)
  if (!token) return null
  const { data } = await supabase.auth.getUser(token)
  return data.user?.id ?? null
}

// ---------------------------------------------------------------------------
// Google OAuth helpers
// ---------------------------------------------------------------------------

function buildGoogleAuthUrl(businessId: string): string {
  const state  = Buffer.from(businessId).toString("base64url")
  const params = new URLSearchParams({
    client_id:     Bun.env.GOOGLE_CLIENT_ID!,
    redirect_uri:  Bun.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope:         "https://www.googleapis.com/auth/calendar email",
    access_type:   "offline",
    prompt:        "consent", // force refresh_token every time
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

async function exchangeCodeForTokens(code: string): Promise<{
  accessToken:  string
  refreshToken: string
  expiresAt:    Date
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     Bun.env.GOOGLE_CLIENT_ID!,
      client_secret: Bun.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  Bun.env.GOOGLE_REDIRECT_URI!,
      grant_type:    "authorization_code",
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google token exchange failed: ${err}`)
  }
  const data = await res.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    new Date(Date.now() + data.expires_in * 1000),
  }
}

async function getGoogleUserInfo(accessToken: string): Promise<{ id: string; email: string }> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error("Failed to fetch Google user info")
  return res.json() as Promise<{ id: string; email: string }>
}

async function assertMember(businessId: string, userId: string): Promise<boolean> {
  const [member] = await db
    .select()
    .from(businessMembers)
    .where(and(eq(businessMembers.businessId, businessId), eq(businessMembers.userId, userId)))
    .limit(1)
  return !!member
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export const calendarRoutes = new Elysia({ prefix: "/calendar" })

  // GET /calendar/connection/:businessId — current connection status (authenticated)
  .get(
    "/connection/:businessId",
    async ({ params, headers, set }) => {
      const userId = await getUserId(headers)
      if (!userId) { set.status = 401; return { error: "Unauthorized" } }
      if (!(await assertMember(params.businessId, userId))) { set.status = 403; return { error: "Forbidden" } }

      const [conn] = await db
        .select({
          providerEmail: calendarConnections.providerEmail,
          provider:      calendarConnections.provider,
          isActive:      calendarConnections.isActive,
        })
        .from(calendarConnections)
        .where(and(eq(calendarConnections.businessId, params.businessId), eq(calendarConnections.isActive, true)))
        .limit(1)

      return { connection: conn ?? null }
    },
    { params: t.Object({ businessId: t.String() }) },
  )

  // GET /calendar/auth-url?businessId=xxx — returns Google consent URL (authenticated)
  .get(
    "/auth-url",
    async ({ query, headers, set }) => {
      const businessId = (query as Record<string, string>).businessId
      if (!businessId) { set.status = 400; return { error: "businessId is required" } }

      const userId = await getUserId(headers)
      if (!userId) { set.status = 401; return { error: "Unauthorized" } }
      if (!(await assertMember(businessId, userId))) { set.status = 403; return { error: "Forbidden" } }

      return { url: buildGoogleAuthUrl(businessId) }
    },
  )

  // GET /calendar/callback?code=xxx&state=base64(businessId)
  // Google redirects here — no auth header, state carries businessId.
  .get(
    "/callback",
    async ({ query }) => {
      const redirect = (path: string) =>
        new Response(null, { status: 302, headers: { Location: `${WEB_URL}${path}` } })

      const p        = query as Record<string, string>
      const code     = p.code
      const stateB64 = p.state
      const error    = p.error

      if (error || !code || !stateB64) return redirect("/dashboard?calendar=error")

      let businessId: string
      try {
        businessId = Buffer.from(stateB64, "base64url").toString("utf8")
      } catch {
        return redirect("/dashboard?calendar=error")
      }

      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, businessId))
        .limit(1)

      if (!business) return redirect("/dashboard?calendar=error")

      try {
        const { accessToken, refreshToken, expiresAt } = await exchangeCodeForTokens(code)
        const { id: providerAccountId, email: providerEmail } = await getGoogleUserInfo(accessToken)

        await db
          .insert(calendarConnections)
          .values({
            businessId,
            provider:          "google",
            providerAccountId,
            providerEmail,
            accessToken,
            refreshToken,
            tokenExpiry: expiresAt,
            isActive:    true,
            updatedAt:   new Date(),
          })
          .onConflictDoUpdate({
            target: [calendarConnections.businessId, calendarConnections.provider],
            set: {
              providerAccountId,
              providerEmail,
              accessToken,
              refreshToken,
              tokenExpiry: expiresAt,
              isActive:    true,
              updatedAt:   new Date(),
            },
          })

        return redirect("/dashboard?calendar=connected")
      } catch (err) {
        console.error("Calendar OAuth callback error:", err)
        return redirect("/dashboard?calendar=error")
      }
    },
  )

  // POST /calendar/:businessId/test-event — creates a 30-min test event within business hours
  // Finds the next open business day (starting today) and books at the first available slot
  // at or after 17:00. Falls back to 10:00 if 17:00 is outside the day's hours.
  // Guards: enforces business hours, then checks freebusy.
  .post(
    "/:businessId/test-event",
    async ({ params, headers, set }) => {
      const userId = await getUserId(headers)
      if (!userId) { set.status = 401; return { error: "Unauthorized" } }
      if (!(await assertMember(params.businessId, userId))) { set.status = 403; return { error: "Forbidden" } }

      const {
        getActiveConnection,
        assertWithinBusinessHours,
      } = await import("../services/calendar/index")
      const { GoogleCalendarAdapter } = await import("../services/calendar/google")

      // Load business to read hours
      const [business] = await db
        .select({ aiConfig: businesses.aiConfig })
        .from(businesses)
        .where(eq(businesses.id, params.businessId))
        .limit(1)

      if (!business) { set.status = 404; return { error: "Business not found" } }

      const connection = await getActiveConnection(params.businessId)
      if (!connection) { set.status = 404; return { error: "No calendar connected" } }

      if (connection.provider !== "google") {
        set.status = 400; return { error: "Unsupported provider for test event" }
      }

      const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const hoursMap = (business.aiConfig as { businessHours?: Record<string, { open: boolean; from: string; to: string }> } | null)?.businessHours

      // Always use TODAY at 10:00 AM — predictable, no silent day-hopping.
      // If today is closed or 10 AM is outside hours, return a clear error
      // so the user knows exactly why and what to do next.
      const now       = new Date()
      const todayName = DAY_NAMES[now.getDay()]
      const dayHours  = hoursMap?.[todayName]

      if (hoursMap && !dayHours?.open) {
        const openDays = Object.entries(hoursMap)
          .filter(([, h]) => h.open)
          .map(([day]) => day)
          .join(", ")
        set.status = 400
        return {
          error: `Today is ${todayName} which is outside business hours. Open days: ${openDays || "none configured"}. Please test on an open day.`,
        }
      }

      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0)
      const end   = new Date(start.getTime() + 30 * 60 * 1000)

      // Business hours check — catches edge cases (e.g., open=true but hours 11:00–17:00)
      try {
        await assertWithinBusinessHours(params.businessId, start.toISOString(), 30)
      } catch (err) {
        set.status = 400
        return { error: (err as Error).message }
      }

      // Freebusy check — only create if the slot is actually free
      const freeSlots = await GoogleCalendarAdapter.checkAvailability({
        connection,
        from:            start.toISOString(),
        to:              end.toISOString(),
        durationMinutes: 30,
      })

      if (freeSlots.length === 0) {
        set.status = 409
        return { error: `The ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} slot on ${start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} is already occupied. Delete the existing test event first.` }
      }

      // Create directly so we can set frontdesk_type: "test" (bookAppointment sets "booking")
      const conn = await GoogleCalendarAdapter.refreshIfNeeded(connection)
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary:     "Front Desk API Test",
          description: "Created by Front Desk dashboard — safe to delete",
          start: { dateTime: start.toISOString() },
          end:   { dateTime: end.toISOString() },
          extendedProperties: {
            private: { frontdesk_created: "true", frontdesk_type: "test" },
          },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        set.status = 502
        return { error: `Google API error: ${err}` }
      }

      const created = await res.json() as { id: string; summary: string; start: { dateTime: string }; end: { dateTime: string } }
      return { event: { eventId: created.id, summary: created.summary, startTime: created.start.dateTime, endTime: created.end.dateTime } }
    },
    { params: t.Object({ businessId: t.String() }) },
  )

  // PATCH /calendar/:businessId/events/:eventId — update event to 18:00–18:30 (authenticated)
  .patch(
    "/:businessId/events/:eventId",
    async ({ params, headers, set }) => {
      const userId = await getUserId(headers)
      if (!userId) { set.status = 401; return { error: "Unauthorized" } }
      if (!(await assertMember(params.businessId, userId))) { set.status = 403; return { error: "Forbidden" } }

      const { getActiveConnection } = await import("../services/calendar/index")
      const { GoogleCalendarAdapter } = await import("../services/calendar/google")

      const connection = await getActiveConnection(params.businessId)
      if (!connection) { set.status = 404; return { error: "No calendar connected" } }

      const conn = await GoogleCalendarAdapter.refreshIfNeeded(connection)

      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0)
      const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 30, 0)

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${params.eventId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: { dateTime: start.toISOString() },
            end:   { dateTime: end.toISOString() },
            summary: "Front Desk API Test (updated)",
          }),
        },
      )

      if (!res.ok) {
        const err = await res.text()
        set.status = 502
        return { error: `Google API error: ${err}` }
      }

      const updated = await res.json() as { id: string; summary: string; start: { dateTime: string }; end: { dateTime: string } }
      return { event: { eventId: updated.id, summary: updated.summary, startTime: updated.start.dateTime, endTime: updated.end.dateTime } }
    },
    { params: t.Object({ businessId: t.String(), eventId: t.String() }) },
  )

  // DELETE /calendar/:businessId/events/:eventId — delete a calendar event (authenticated)
  // Safety: fetches the event first and only allows deletion if frontdesk_type === "test".
  // Real bookings (frontdesk_type === "booking") are refused — they must be cancelled through
  // a proper cancellation flow, not silently removed from the calendar.
  .delete(
    "/:businessId/events/:eventId",
    async ({ params, headers, set }) => {
      const userId = await getUserId(headers)
      if (!userId) { set.status = 401; return { error: "Unauthorized" } }
      if (!(await assertMember(params.businessId, userId))) { set.status = 403; return { error: "Forbidden" } }

      const { getActiveConnection } = await import("../services/calendar/index")
      const { GoogleCalendarAdapter } = await import("../services/calendar/google")

      const connection = await getActiveConnection(params.businessId)
      if (!connection) { set.status = 404; return { error: "No calendar connected" } }

      const conn = await GoogleCalendarAdapter.refreshIfNeeded(connection)
      const GCAL = "https://www.googleapis.com/calendar/v3"

      // Fetch the event and check it's a test event before touching it
      const fetchRes = await fetch(`${GCAL}/calendars/primary/events/${params.eventId}`, {
        headers: { Authorization: `Bearer ${conn.accessToken}` },
      })

      if (!fetchRes.ok) {
        set.status = fetchRes.status === 404 ? 404 : 502
        return { error: fetchRes.status === 404 ? "Event not found" : "Failed to fetch event from Google" }
      }

      const event = await fetchRes.json() as {
        extendedProperties?: { private?: { frontdesk_type?: string } }
      }

      const type = event.extendedProperties?.private?.frontdesk_type
      if (type !== "test") {
        set.status = 403
        return {
          error:
            type === "booking"
              ? "This is a real appointment booked by the AI — it cannot be deleted here. Cancel it through Google Calendar directly."
              : "This event was not created by Front Desk and cannot be deleted here.",
        }
      }

      const deleteRes = await fetch(`${GCAL}/calendars/primary/events/${params.eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${conn.accessToken}` },
      })

      if (!deleteRes.ok && deleteRes.status !== 410) {
        const err = await deleteRes.text()
        set.status = 502
        return { error: `Google API error: ${err}` }
      }

      return { deleted: true }
    },
    { params: t.Object({ businessId: t.String(), eventId: t.String() }) },
  )

  // DELETE /calendar/:businessId — disconnect calendar (authenticated)
  .delete(
    "/:businessId",
    async ({ params, headers, set }) => {
      const userId = await getUserId(headers)
      if (!userId) { set.status = 401; return { error: "Unauthorized" } }
      if (!(await assertMember(params.businessId, userId))) { set.status = 403; return { error: "Forbidden" } }

      await db
        .update(calendarConnections)
        .set({ isActive: false, accessToken: null, refreshToken: null, updatedAt: new Date() })
        .where(and(eq(calendarConnections.businessId, params.businessId), eq(calendarConnections.provider, "google")))

      return { disconnected: true }
    },
    { params: t.Object({ businessId: t.String() }) },
  )
