import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { PhoneIncoming, PhoneMissed, PhoneCall, X } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL as string

interface CallLog {
  id: string
  callerNumber: string
  status: "in_progress" | "completed" | "missed" | "transferred"
  durationSeconds: number | null
  summary: string | null
  startedAt: string
  endedAt: string | null
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

const STATUS_CONFIG = {
  completed:   { label: "Answered",    icon: <PhoneIncoming size={14} />, class: "text-green-600 bg-green-50" },
  missed:      { label: "Missed",      icon: <PhoneMissed size={14} />,   class: "text-red-500 bg-red-50" },
  transferred: { label: "Transferred", icon: <PhoneCall size={14} />,     class: "text-blue-600 bg-blue-50" },
  in_progress: { label: "Live",        icon: <PhoneCall size={14} />,     class: "text-amber-600 bg-amber-50" },
}

// ---------------------------------------------------------------------------
// Summary modal
// ---------------------------------------------------------------------------

function SummaryModal({
  call,
  onClose,
}: {
  call: CallLog
  onClose: () => void
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
              Call summary
            </p>
            <p className="font-semibold text-foreground">{call.callerNumber}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(call.startedAt)}</p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {call.summary}
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------

export function CallLogsTab() {
  const { business } = useAuth()
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)

  useEffect(() => {
    if (!business?.id) return

    const fetchCalls = async () => {
      try {
        const res = await fetch(`${API_URL}/businesses/${business.id}/calls`)
        const data = await res.json() as { calls: CallLog[] }
        setCallLogs(data.calls ?? [])
      } finally {
        setLoading(false)
      }
    }

    fetchCalls()
    const interval = setInterval(fetchCalls, 30_000)
    return () => clearInterval(interval)
  }, [business?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-indigo-600" />
      </div>
    )
  }

  if (callLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <PhoneCall size={20} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">No calls yet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Calls will appear here once your AI receptionist starts answering.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Calls</h2>
          <span className="text-sm text-muted-foreground">{callLogs.length} calls</span>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Caller</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {callLogs.map((call) => {
                const cfg = STATUS_CONFIG[call.status] ?? STATUS_CONFIG.completed
                return (
                  <tr key={call.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-foreground">{call.callerNumber}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.class}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDuration(call.durationSeconds)}</td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{formatDate(call.startedAt)}</td>
                    <td className="px-5 py-4">
                      {call.summary ? (
                        <button
                          aria-label="View summary"
                          onClick={() => setSelectedCall(call)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                        >
                          View summary
                        </button>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">No summary</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCall && (
        <SummaryModal call={selectedCall} onClose={() => setSelectedCall(null)} />
      )}
    </>
  )
}
