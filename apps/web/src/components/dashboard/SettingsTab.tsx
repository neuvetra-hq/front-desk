import { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL as string

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
type Day = typeof DAYS[number]

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

export function SettingsTab() {
  const { business, session } = useAuth()
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)
  const [calendarConn, setCalendarConn] = useState<CalendarConnection | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [testEventLoading, setTestEventLoading] = useState(false)
  const [testEventId, setTestEventId] = useState<string | null>(null)
  const [modifyEventLoading, setModifyEventLoading] = useState(false)
  const [deleteEventLoading, setDeleteEventLoading] = useState(false)
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

  const handleTestEvent = async () => {
    if (!business?.id) return
    setTestEventLoading(true)
    try {
      const res = await fetch(`${API_URL}/calendar/${business.id}/test-event`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const data = await res.json() as { event?: { eventId: string; summary: string; startTime: string }; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to create test event")
      if (data.event?.eventId) setTestEventId(data.event.eventId)
      toast.success(`Test event created: "${data.event?.summary}"`)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create test event")
    } finally {
      setTestEventLoading(false)
    }
  }

  const handleModifyEvent = async () => {
    if (!business?.id || !testEventId) return
    setModifyEventLoading(true)
    try {
      const res = await fetch(`${API_URL}/calendar/${business.id}/events/${testEventId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const data = await res.json() as { event?: { summary: string; startTime: string }; error?: string }
      if (data.error) throw new Error(data.error)
      toast.success(`Event updated: "${data.event?.summary}" → 6:00 PM`)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update event")
    } finally {
      setModifyEventLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!business?.id || !testEventId) return
    setDeleteEventLoading(true)
    try {
      const res = await fetch(`${API_URL}/calendar/${business.id}/events/${testEventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const data = await res.json() as { deleted?: boolean; error?: string }
      if (data.error) throw new Error(data.error)
      setTestEventId(null)
      toast.success("Test event deleted")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to delete event")
    } finally {
      setDeleteEventLoading(false)
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
      toast.success("Calendar disconnected")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to disconnect calendar")
    } finally {
      setCalendarLoading(false)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiConfig: { businessHours: hours } }),
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

      {/* Business hours */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Business Hours</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Your AI will mention these hours when callers ask. It will still answer calls 24/7.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`flex items-center gap-4 px-5 py-3.5 ${i < DAYS.length - 1 ? "border-b border-neutral-100" : ""}`}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => updateDay(day, { open: !hours[day].open })}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  hours[day].open ? "bg-indigo-600" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    hours[day].open ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>

              {/* Day name */}
              <span className={`w-24 text-sm font-medium ${hours[day].open ? "text-neutral-900" : "text-neutral-400"}`}>
                {day}
              </span>

              {hours[day].open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={hours[day].from}
                    onChange={(e) => updateDay(day, { from: e.target.value })}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-neutral-400">to</span>
                  <input
                    type="time"
                    value={hours[day].to}
                    onChange={(e) => updateDay(day, { to: e.target.value })}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <span className="text-sm text-neutral-400">Closed</span>
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
          <h2 className="text-lg font-semibold text-neutral-900">Calendar</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Connect your calendar so your AI can check availability and book appointments during calls.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          {calendarConn ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Google Calendar icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="4" fill="#fff"/>
                      <path d="M17 3h-1V1h-2v2H10V1H8v2H7C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V9h10v10z" fill="#4285F4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Google Calendar</p>
                    <p className="text-xs text-neutral-400">Connected as {calendarConn.providerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestEvent}
                    disabled={testEventLoading || calendarLoading}
                    className="shrink-0 text-sm"
                  >
                    {testEventLoading ? "Creating…" : "Create Test Event"}
                  </Button>
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

              {testEventId && (
                <div className="flex items-center gap-2 rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-2.5">
                  <span className="text-xs text-neutral-500 flex-1">Last test event ready to modify or delete</span>
                  <Button
                    variant="outline"
                    onClick={handleModifyEvent}
                    disabled={modifyEventLoading || deleteEventLoading}
                    className="text-xs h-7 px-3"
                  >
                    {modifyEventLoading ? "Updating…" : "Modify (→ 6 PM)"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteEvent}
                    disabled={deleteEventLoading || modifyEventLoading}
                    className="text-xs h-7 px-3 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {deleteEventLoading ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">No calendar connected</p>
                <p className="text-xs text-neutral-400 mt-0.5">
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
          <h2 className="text-lg font-semibold text-neutral-900">Call Forwarding Setup</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Forward unanswered calls from your existing number to your AI Front Desk number.
          </p>
        </div>

        {business?.twilioNumber && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
              <span className="text-sm text-indigo-700">Your AI number:</span>
              <span className="font-mono font-semibold text-indigo-900">{business.twilioNumber}</span>
            </div>

            <div className="space-y-3 text-sm text-neutral-600">
              <div className="space-y-1">
                <p className="font-semibold text-neutral-800">📱 iPhone</p>
                <p className="text-neutral-500 ml-5">Settings → Phone → Call Forwarding → enter <span className="font-mono">{business.twilioNumber}</span></p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-neutral-800">📱 Android</p>
                <p className="text-neutral-500 ml-5">Phone app → ⋮ Menu → Settings → Calls → Call forwarding → Forward when unanswered</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-neutral-800">☎️ VoIP / Office line</p>
                <p className="text-neutral-500 ml-5">Contact your provider and ask to forward unanswered calls to <span className="font-mono">{business.twilioNumber}</span></p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-neutral-800">📞 AT&T / T-Mobile / Verizon</p>
                <p className="text-neutral-500 ml-5">Dial <span className="font-mono">*71{business.twilioNumber.replace(/\D/g, "").slice(-10)}</span> from your phone to enable forwarding when busy/unanswered</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
