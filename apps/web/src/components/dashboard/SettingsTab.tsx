import { useState } from "react"
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

export function SettingsTab() {
  const { business } = useAuth()
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)

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
