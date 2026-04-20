import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { CalDAVConnectDialog } from "./CalDAVConnectDialog"

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
  provider: "google" | "outlook" | "caldav"
  providerEmail: string | null
  isActive: boolean
}

const PROVIDER_LABELS: Record<CalendarConnection["provider"], string> = {
  google:  "Google Calendar",
  outlook: "Outlook Calendar",
  caldav:  "Apple / CalDAV Calendar",
}

function CalendarProviderIcon({ provider, size = 20 }: { provider: CalendarConnection["provider"]; size?: number }) {
  const s = size
  if (provider === "outlook") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0078D4"/>
        <path d="M13 6h6.5A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5H13V6z" fill="#fff" fillOpacity=".3"/>
        <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h8A1.5 1.5 0 0 1 14 8.5v7A1.5 1.5 0 0 1 12.5 17h-8A1.5 1.5 0 0 1 3 15.5v-7z" fill="#fff"/>
        <path d="M8.5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="#0078D4"/>
      </svg>
    )
  }
  if (provider === "caldav") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#f5f5f7"/>
        <path d="M17 3h-1V1h-2v2H10V1H8v2H7C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V9h10v10z" fill="#555"/>
        <circle cx="15" cy="13" r="1.5" fill="#555"/>
        <circle cx="11.5" cy="13" r="1.5" fill="#555"/>
        <circle cx="8" cy="13" r="1.5" fill="#555"/>
      </svg>
    )
  }
  // google
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#fff"/>
      <path d="M17 3h-1V1h-2v2H10V1H8v2H7C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V9h10v10z" fill="#4285F4"/>
    </svg>
  )
}

function ProviderRow({
  icon, name, description, onConnect, loading, border,
}: {
  icon:        React.ReactNode
  name:        string
  description: string
  onConnect:   () => void
  loading:     boolean
  border?:     boolean
}) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${border ? "border-b border-border" : ""}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onConnect}
        disabled={loading}
        className="shrink-0"
      >
        Connect
      </Button>
    </div>
  )
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
  const [businessName, setBusinessName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [collectAddress, setCollectAddress] = useState(false)
  const [agentSaving, setAgentSaving] = useState(false)
  const [calendarConn, setCalendarConn] = useState<CalendarConnection | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [caldavOpen, setCaldavOpen] = useState(false)
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
      toast.success("Calendar connected!")
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

  const handleConnectCalendar = async (provider: "google" | "outlook") => {
    if (!business?.id) return
    setCalendarLoading(true)
    try {
      const endpoint = provider === "outlook"
        ? `${API_URL}/calendar/microsoft/auth-url?businessId=${business.id}`
        : `${API_URL}/calendar/auth-url?businessId=${business.id}`
      const res = await fetch(endpoint, {
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
    if (cfg.businessName) setBusinessName(cfg.businessName as string)
    if (cfg.ownerPhone) setOwnerPhone(cfg.ownerPhone as string)
    setCollectAddress(!!(cfg.collectAddress as boolean | undefined))
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
        body: JSON.stringify({ aiConfig: { agentName, businessName, ownerPhone, collectAddress } }),
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
            <Label htmlFor="agent-name">Agent name</Label>
            <Input
              id="agent-name"
              placeholder="e.g. Alex"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              How the AI introduces itself — "Hi, I'm Alex, calling on behalf of…"
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="business-display-name">Business display name</Label>
            <Input
              id="business-display-name"
              placeholder={`e.g. ${business?.name?.split(" ").slice(0, 2).join(" ") ?? "Nima's Plumbing"}`}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The name the AI uses when speaking with callers. Leave blank to use your full registered business name.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emergency-phone">Emergency contact number</Label>
            <Input
              id="emergency-phone"
              placeholder="e.g. +14155551234"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If a caller reports an emergency, the AI will immediately transfer to this number.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            <div className="space-y-0.5">
              <Label htmlFor="collect-address">Collect customer address</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, the AI will ask for the customer's full address (with zip code) during booking and attach it to the calendar event.
              </p>
            </div>
            <Switch
              id="collect-address"
              checked={collectAddress}
              onCheckedChange={setCollectAddress}
            />
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
            <Label>Timezone</Label>
            <Select
              items={TIMEZONES.map((tz) => ({ label: tz.label, value: tz.value }))}
              value={timezone}
              onValueChange={(v) => { if (v) setTimezone(v) }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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

        {calendarConn ? (
          /* Connected state */
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <CalendarProviderIcon provider={calendarConn.provider} size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {PROVIDER_LABELS[calendarConn.provider]}
                  </p>
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
          </div>
        ) : (
          /* Provider list */
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <ProviderRow
              icon={<CalendarProviderIcon provider="google" size={20} />}
              name="Google Calendar"
              description="Connect via Google OAuth"
              onConnect={() => handleConnectCalendar("google")}
              loading={calendarLoading}
              border
            />
            <ProviderRow
              icon={<CalendarProviderIcon provider="outlook" size={20} />}
              name="Outlook Calendar"
              description="Microsoft 365, Outlook.com"
              onConnect={() => handleConnectCalendar("outlook")}
              loading={calendarLoading}
              border
            />
            <ProviderRow
              icon={<CalendarProviderIcon provider="caldav" size={20} />}
              name="Apple / CalDAV"
              description="iCloud, Fastmail, Nextcloud, and more"
              onConnect={() => setCaldavOpen(true)}
              loading={calendarLoading}
            />
          </div>
        )}

        <CalDAVConnectDialog
          open={caldavOpen}
          onOpenChange={setCaldavOpen}
          onConnected={(email) => {
            setCalendarConn({ provider: "caldav", providerEmail: email, isActive: true })
            onCalendarChange?.(true)
          }}
        />
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
