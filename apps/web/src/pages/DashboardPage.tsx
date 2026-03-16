import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL as string

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  medical: "Medical",
  dental: "Dental",
  spa: "Spa",
  salon: "Salon",
  plumbing: "Plumbing",
  legal: "Legal",
  real_estate: "Real Estate",
  other: "Other",
}

export function DashboardPage() {
  const { user, business, signOut, refreshBusiness } = useAuth()
  const [releasing, setReleasing] = useState(false)
  const [confirmRelease, setConfirmRelease] = useState(false)

  const handleRelease = async () => {
    if (!business) return
    setReleasing(true)
    try {
      const res = await fetch(`${API_URL}/businesses/${business.id}/release`, {
        method: "POST",
      })
      const data = await res.json() as Record<string, unknown>
      if (data.error) throw new Error(data.error as string)
      toast.success("Phone number released. Redirecting to setup…")
      await refreshBusiness()
      // ProtectedRoute will auto-redirect to /onboarding once status = "inactive"
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to release number")
    } finally {
      setReleasing(false)
      setConfirmRelease(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-neutral-900">Front Desk</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>

        {/* Business card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Business</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">{business?.name}</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              business?.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-neutral-100 text-neutral-500"
            }`}>
              {business?.status}
            </span>
          </div>

          <div className="border-t border-neutral-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Type</p>
              <p className="mt-1 text-sm text-neutral-700">
                {business?.businessType ? BUSINESS_TYPE_LABELS[business.businessType] ?? business.businessType : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Phone Number</p>
              <p className="mt-1 text-sm font-mono text-neutral-700">
                {business?.twilioNumber ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Release section */}
        {business?.twilioNumber && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 space-y-3">
            <div>
              <p className="font-medium text-red-800">Release phone number</p>
              <p className="text-sm text-red-600 mt-1">
                This will release <span className="font-mono font-semibold">{business.twilioNumber}</span> from your account and deactivate your Front Desk. You can re-provision a new number any time.
              </p>
            </div>
            {!confirmRelease ? (
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => setConfirmRelease(true)}
              >
                Release number
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleRelease}
                  disabled={releasing}
                >
                  {releasing ? "Releasing…" : "Yes, release it"}
                </Button>
                <Button variant="outline" onClick={() => setConfirmRelease(false)} disabled={releasing}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
