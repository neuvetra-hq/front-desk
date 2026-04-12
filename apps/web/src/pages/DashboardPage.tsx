import { useState, useEffect } from "react"
import { useParams, useNavigate, Navigate } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { PhoneCall, Settings, BookOpen, BarChart2, LogOut, Phone, AlertTriangle, MessageSquare } from "lucide-react"
import { CallLogsTab } from "@/components/dashboard/CallLogsTab"
import { UsageTab } from "@/components/dashboard/UsageTab"
import { KnowledgeBaseTab } from "@/components/dashboard/KnowledgeBaseTab"
import { SettingsTab } from "@/components/dashboard/SettingsTab"

const API_URL = import.meta.env.VITE_API_URL as string

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  medical: "Medical / Healthcare",
  dental: "Dental",
  spa: "MedSpa / Wellness",
  salon: "Salon & Beauty",
  plumbing: "Plumbing & Trades",
  legal: "Legal",
  real_estate: "Real Estate",
  other: "Other",
}

// Map Stripe flat price IDs → plan display info
// Price IDs come from VITE_ vars — we derive plan from the business.stripePlanId
const PLAN_MAP: Record<string, { name: string; minutes: number; color: string }> = {
  starter: { name: "Starter", minutes: 150, color: "bg-neutral-100 text-neutral-700" },
  growth:  { name: "Growth",  minutes: 400, color: "bg-indigo-100 text-indigo-700" },
  pro:     { name: "Pro",     minutes: 1000, color: "bg-violet-100 text-violet-700" },
}

// Derive plan key from Stripe price ID env vars
function getPlanKey(stripePlanId: string | null): keyof typeof PLAN_MAP | null {
  if (!stripePlanId) return null
  if (stripePlanId === import.meta.env.VITE_STRIPE_PRICE_STARTER_FLAT) return "starter"
  if (stripePlanId === import.meta.env.VITE_STRIPE_PRICE_GROWTH_FLAT)  return "growth"
  if (stripePlanId === import.meta.env.VITE_STRIPE_PRICE_PRO_FLAT)     return "pro"
  return null
}

type Tab = "overview" | "calls" | "messages" | "usage" | "knowledge" | "settings"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",      icon: <BarChart2     size={16} /> },
  { id: "calls",     label: "Call Logs",      icon: <PhoneCall     size={16} /> },
  { id: "messages",  label: "Messages",       icon: <MessageSquare size={16} /> },
  { id: "usage",     label: "Usage",          icon: <BarChart2     size={16} /> },
  { id: "knowledge", label: "Knowledge Base", icon: <BookOpen      size={16} /> },
  { id: "settings",  label: "Settings",       icon: <Settings      size={16} /> },
]

export function DashboardPage() {
  const { profile, business, session, signOut } = useAuth()
  const { tab: rawTab } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const validTabs = TABS.map((t) => t.id)
  const tab: Tab = (validTabs.includes(rawTab as Tab) ? rawTab : "overview") as Tab
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null)

  // Redirect unknown tab params to overview
  if (rawTab && !validTabs.includes(rawTab as Tab)) {
    return <Navigate to="/dashboard/overview" replace />
  }

  useEffect(() => {
    if (!business?.id) return
    fetch(`${API_URL}/calendar/connection/${business.id}`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
    })
      .then((r) => r.json())
      .then((data: { connection?: { isActive: boolean } }) => {
        setCalendarConnected(data.connection?.isActive === true)
      })
      .catch(() => setCalendarConnected(false))
  }, [business?.id])

  const planKey = getPlanKey(business?.stripePlanId ?? null)
  const plan = planKey ? PLAN_MAP[planKey] : null

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
              <span className="text-xs font-black text-white">FD</span>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">Front Desk</span>
            {business?.status === "active" && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-neutral-500">
              {profile?.firstName} {profile?.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5">
              <LogOut size={14} />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Status banner */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center gap-6">

            {/* AI number */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Phone size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">AI Number</p>
                <p className="font-mono text-base font-semibold text-neutral-900">
                  {business?.twilioNumber ?? "—"}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-neutral-200 hidden sm:block" />

            {/* Business */}
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Business</p>
              <p className="text-base font-semibold text-neutral-900">{business?.name ?? "—"}</p>
            </div>

            <div className="h-8 w-px bg-neutral-200 hidden sm:block" />

            {/* Type */}
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Type</p>
              <p className="text-sm text-neutral-700">
                {business?.businessType ? BUSINESS_TYPE_LABELS[business.businessType] ?? business.businessType : "—"}
              </p>
            </div>

            {/* Plan badge */}
            {plan && (
              <>
                <div className="h-8 w-px bg-neutral-200 hidden sm:block" />
                <div>
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Plan</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${plan.color}`}>
                    {plan.name} · {plan.minutes} min/mo
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex gap-1" aria-label="Dashboard tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/dashboard/${t.id}`)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* No-calendar warning banner */}
      {calendarConnected === false && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-3">
            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 flex-1">
              <strong>No calendar connected</strong> — your AI can answer calls but cannot check availability or book appointments.
            </p>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="shrink-0 text-sm font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              Connect calendar →
            </button>
          </div>
        </div>
      )}

      {/* Tab content */}
      <main className="mx-auto w-full max-w-6xl px-6 py-8 flex-1">
        {tab === "overview"  && <OverviewTab />}
        {tab === "calls"     && <CallLogsTab />}
        {tab === "messages"  && <MessagesTab />}
        {tab === "usage"     && <UsageTab />}
        {tab === "knowledge" && <KnowledgeBaseTab />}
        {tab === "settings"  && <SettingsTab onCalendarChange={setCalendarConnected} />}
      </main>
    </div>
  )
}

function OverviewTab() {
  const { business, profile } = useAuth()
  const planKey = getPlanKey(business?.stripePlanId ?? null)
  const plan = planKey ? PLAN_MAP[planKey] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {profile?.firstName} 👋
        </h1>
        <p className="mt-1 text-neutral-500 text-sm">
          Your AI receptionist is {business?.status === "active" ? "live and answering calls." : "not yet active."}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="AI Phone Number"
          value={business?.twilioNumber ?? "—"}
          mono
          hint="Forward missed calls from your existing number to this one"
        />
        <SummaryCard
          label="Status"
          value={business?.status === "active" ? "Live" : "Inactive"}
          valueClass={business?.status === "active" ? "text-green-600" : "text-neutral-400"}
          hint={business?.status === "active" ? "Your AI is answering calls" : "Complete setup to go live"}
        />
        <SummaryCard
          label="Plan"
          value={plan ? `${plan.name} — ${plan.minutes} min/mo` : "—"}
          hint="Manage billing in the Usage tab"
        />
      </div>

      {/* Call forwarding instructions */}
      {business?.twilioNumber && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6">
          <h2 className="font-semibold text-indigo-900 mb-1">How to activate call forwarding</h2>
          <p className="text-sm text-indigo-700 mb-4">
            Forward missed calls from your existing business number to your AI Front Desk number.
          </p>
          <div className="space-y-2 text-sm text-indigo-800">
            <p>📱 <strong>iPhone:</strong> Settings → Phone → Call Forwarding → enter <span className="font-mono font-semibold">{business.twilioNumber}</span></p>
            <p>📱 <strong>Android:</strong> Phone app → Settings → Supplementary services → Forward when unanswered → enter <span className="font-mono font-semibold">{business.twilioNumber}</span></p>
            <p>☎️ <strong>VoIP / Office line:</strong> Contact your provider and ask them to forward unanswered calls to <span className="font-mono font-semibold">{business.twilioNumber}</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Messages tab — callback requests left by callers when scheduling was down
// ---------------------------------------------------------------------------

interface CallbackRequest {
  id: string
  callerPhone: string
  callerName: string | null
  message: string | null
  status: string
  createdAt: string
}

function MessagesTab() {
  const { business, session } = useAuth()
  const [messages, setMessages] = useState<CallbackRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business?.id) return
    fetch(`${API_URL}/businesses/${business.id}/messages`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
    })
      .then((r) => r.json())
      .then((data: { messages?: CallbackRequest[] }) => {
        setMessages(data.messages ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [business?.id])

  const markHandled = async (messageId: string) => {
    await fetch(`${API_URL}/businesses/${business!.id}/messages/${messageId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
    })
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, status: "handled" } : m))
  }

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading…</p>
  }

  const pending = messages.filter((m) => m.status === "pending")
  const handled = messages.filter((m) => m.status === "handled")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Callback Requests</h2>
        <p className="text-sm text-neutral-400 mt-0.5">
          Callers who asked to be called back when scheduling was unavailable.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-sm text-neutral-400">No callback requests yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Pending ({pending.length})
              </p>
              {pending.map((m) => (
                <MessageCard key={m.id} message={m} onMarkHandled={markHandled} />
              ))}
            </div>
          )}

          {handled.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Handled ({handled.length})
              </p>
              {handled.map((m) => (
                <MessageCard key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MessageCard({ message, onMarkHandled }: { message: CallbackRequest; onMarkHandled?: (id: string) => void }) {
  const date = new Date(message.createdAt).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  })

  return (
    <div className={`rounded-xl border bg-white p-4 flex items-start gap-4 ${
      message.status === "pending" ? "border-amber-200" : "border-neutral-200 opacity-60"
    }`}>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-neutral-900">
            {message.callerName ?? "Unknown caller"}
          </span>
          <span className="font-mono text-xs text-neutral-500">{message.callerPhone}</span>
          {message.status === "pending" && (
            <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">
              Needs callback
            </span>
          )}
        </div>
        {message.message && (
          <p className="text-sm text-neutral-600 truncate">{message.message}</p>
        )}
        <p className="text-xs text-neutral-400">{date}</p>
      </div>
      {onMarkHandled && message.status === "pending" && (
        <Button
          variant="outline"
          className="shrink-0 text-xs h-8 px-3"
          onClick={() => onMarkHandled(message.id)}
        >
          Mark handled
        </Button>
      )}
    </div>
  )
}

function SummaryCard({
  label, value, mono, hint, valueClass,
}: {
  label: string
  value: string
  mono?: boolean
  hint?: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-1">
      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-semibold text-neutral-900 ${mono ? "font-mono" : ""} ${valueClass ?? ""}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}

