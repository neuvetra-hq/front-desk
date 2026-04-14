import { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL as string

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
type Day = typeof DAYS[number]

const TIMEZONES = [
  { value: "America/New_York",    label: "Eastern Time (ET) — New York, Miami" },
  { value: "America/Chicago",     label: "Central Time (CT) — Chicago, Dallas" },
  { value: "America/Denver",      label: "Mountain Time (MT) — Denver, Salt Lake City" },
  { value: "America/Phoenix",     label: "Mountain Time — Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT) — Los Angeles, Seattle" },
  { value: "America/Anchorage",   label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu",    label: "Hawaii Time (HT)" },
  { value: "Europe/London",       label: "London (GMT/BST)" },
  { value: "Europe/Paris",        label: "Central European Time (CET)" },
  { value: "Asia/Dubai",          label: "Gulf Standard Time (GST) — Dubai" },
  { value: "Asia/Kolkata",        label: "India Standard Time (IST)" },
  { value: "Asia/Singapore",      label: "Singapore Time (SGT)" },
  { value: "Australia/Sydney",    label: "Australian Eastern Time (AET)" },
] as const

interface DayHours {
  open: boolean
  from: string
  to: string
}

type BusinessHours = Record<Day, DayHours>

const DEFAULT_HOURS: BusinessHours = {
  Monday:    { open: true,  from: "09:00", to: "17:00" },
  Tuesday:   { open: true,  from: "09:00", to: "17:00" },
  Wednesday: { open: true,  from: "09:00", to: "17:00" },
  Thursday:  { open: true,  from: "09:00", to: "17:00" },
  Friday:    { open: true,  from: "09:00", to: "17:00" },
  Saturday:  { open: false, from: "09:00", to: "14:00" },
  Sunday:    { open: false, from: "09:00", to: "14:00" },
}

interface CalendarConnection {
  providerEmail: string | null
  isActive: boolean
}

interface SettingsTabProps {
  onCalendarChange?: (connected: boolean) => void
}

export function SettingsTab({ onCalendarChange }: SettingsTabProps = {}) {
  const { business, session } = useAuth()
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS)
  const [timezone, setTimezone] = useState("America/Los_Angeles")
  const [saving, setSaving] = useState(false)
  const [agentName, setAgentName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [agentSaving, setAgentSaving] = useState(false)
  const [calendarConn, setCalendarConn] = useState<CalendarConnection | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Fetch current calendar connection status on mount
  useEffect(() => {
    if (!business?.id) return
    fetch(`${API_URL}/calendar/connection/${business.id}`, {
      headers: {
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
    })
      .then((r) => r.json())
      .then((data: { connection?: CalendarConnection }) => {
        if (data.connection?.isActive) setCalendarConn(data.connection)
      })
      .catch(() => { /* silently ignore — calendar is optional */ })
  }, [business?.id])

  // Handle OAuth return params (?calendar=connected or ?calendar=error)
  useEffect(() => {
    const status = searchParams.get("calendar")
    if (status === "connected") {
      toast.success("Google Calendar connected!")
      setSearchParams({}, { replace: true })
      onCalendarChange?.(true)
      // Re-fetch connection
      if (business?.id) {
        fetch(`${API_URL}/calendar/connection/${business.id}`)
          .then((r) => r.json())
          .then((data: { connection?: CalendarConnection }) => {
            if (data.connection?.isActive) setCalendarConn(data.connection)
          })
          .catch(() => {})
      }
    } else if (status === "error") {
      toast.error("Calendar connection failed. Please try again.")
      setSearchParams({}, { replace: true })
    }
  }, [searchParams])

  const handleConnectCalendar = async () => {
    if (!business?.id) return
    setCalendarLoading(true)
    try {
      const res = await fetch(`${API_URL}/calendar/auth-url?businessId=${business.id}`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to start calendar connection")
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleDisconnectCalendar = async () => {
    if (!business?.id) return
    setCalendarLoading(true)
    try {
      const res = await fetch(`${API_URL}/calendar/${business.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const data = await res.json() as { disconnected?: boolean; error?: string }
      if (data.error) throw new Error(data.error)
      setCalendarConn(null)
      onCalendarChange?.(false)
      toast.success("Calendar disconnected")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to disconnect calendar")
    } finally {
      setCalendarLoading(false)
    }
  }

  // Load agent settings and business hours from aiConfig
  useEffect(() => {
    if (!business?.aiConfig) return
    const cfg = business.aiConfig
    if (cfg.agentName) setAgentName(cfg.agentName as string)
    if (cfg.ownerPhone) setOwnerPhone(cfg.ownerPhone as string)
    if (cfg.businessHours) setHours(cfg.businessHours as BusinessHours)
    if (cfg.timezone) setTimezone(cfg.timezone as string)
  }, [business?.id])

  const handleSaveAgent = async () => {
    if (!business?.id) return
    setAgentSaving(true)
    try {
      const res = await fetch(`${API_URL}/businesses/${business.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ aiConfig: { agentName, ownerPhone } }),
      })
      const data = await res.json() as { updated?: boolean; error?: string }
      if (data.error) throw new Error(data.error)
      toast.success("Agent settings saved")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to save")
    } finally {
      setAgentSaving(false)
    }
  }

  const updateDay = (day: Day, patch: Partial<DayHours>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  const handleSave = async () => {
    if (!business?.id) return
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/businesses/${business.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ aiConfig: { businessHours: hours, timezone } }),
      })
      const data = await res.json() as { updated?: boolean; error?: string }
      if (data.error) throw new Error(data.error)
      toast.success("Settings saved")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* AI Agent settings */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Agent</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Customize how your AI receptionist introduces itself and who to call in an emergency.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Agent name</label>
            <Input
              placeholder="e.g. Alex"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              How the AI introduces itself — "Hi, I'm Alex, calling on behalf of…"
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Emergency contact number</label>
            <Input
              placeholder="e.g. +14155551234"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If a caller reports an emergency, the AI will immediately transfer to this number.
            </p>
          </div>
        </div>

        <Button onClick={handleSaveAgent} disabled={agentSaving}>
          {agentSaving ? "Saving…" : "Save agent settings"}
        </Button>
      </section>

      {/* Business hours */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Business Hours</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your AI will mention these hours when callers ask. It will still answer calls 24/7.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              All appointment times will be booked in this timezone.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`flex items-center gap-4 px-5 py-3.5 ${i < DAYS.length - 1 ? "border-b border-border" : ""}`}
            >
              {/* Toggle */}
              <Switch
                checked={hours[day].open}
                onCheckedChange={(open) => updateDay(day, { open })}
              />

              {/* Day name */}
              <span className={`w-24 text-sm font-medium ${hours[day].open ? "text-foreground" : "text-muted-foreground"}`}>
                {day}
              </span>

              {hours[day].open ? (
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    type="time"
                    value={hours[day].from}
                    onChange={(e) => updateDay(day, { from: e.target.value })}
                    className="w-auto px-2.5 py-1.5 text-sm"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={hours[day].to}
                    onChange={(e) => updateDay(day, { to: e.target.value })}
                    className="w-auto px-2.5 py-1.5 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save hours"}
        </Button>
      </section>

      {/* Calendar integration */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect your calendar so your AI can check availability and book appointments during calls.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          {calendarConn ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Google Calendar icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#fff"/>
                    <path d="M17 3h-1V1h-2v2H10V1H8v2H7C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V9h10v10z" fill="#4285F4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Connected as {calendarConn.providerEmail}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnectCalendar}
                disabled={calendarLoading}
                className="shrink-0 text-sm text-red-600 border-red-200 hover:bg-red-50"
              >
                {calendarLoading ? "Disconnecting…" : "Disconnect"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">No calendar connected</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Connect Google Calendar to enable appointment booking.
                </p>
              </div>
              <Button
                onClick={handleConnectCalendar}
                disabled={calendarLoading}
                className="shrink-0 text-sm"
              >
                {calendarLoading ? "Connecting…" : "Connect Google Calendar"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call forwarding guide */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Call Forwarding Setup</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Forward unanswered calls from your existing number to your AI Front Desk number.
          </p>
        </div>

        {business?.twilioNumber && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 px-4 py-3">
              <span className="text-sm text-indigo-700 dark:text-indigo-300">Your AI number:</span>
              <span className="font-mono font-semibold text-indigo-900 dark:text-indigo-100">{business.twilioNumber}</span>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">📱 iPhone</p>
                <p className="ml-5">Settings → Phone → Call Forwarding → enter <span className="font-mono">{business.twilioNumber}</span></p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">📱 Android</p>
                <p className="ml-5">Phone app → ⋮ Menu → Settings → Calls → Call forwarding → Forward when unanswered</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">☎️ VoIP / Office line</p>
                <p className="ml-5">Contact your provider and ask to forward unanswered calls to <span className="font-mono">{business.twilioNumber}</span></p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">📞 AT&T / T-Mobile / Verizon</p>
                <p className="ml-5">Dial <span className="font-mono">*71{business.twilioNumber.replace(/\D/g, "").slice(-10)}</span> from your phone to enable forwarding when busy/unanswered</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
