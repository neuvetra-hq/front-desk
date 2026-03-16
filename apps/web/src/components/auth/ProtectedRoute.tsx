import { Navigate, useLocation } from "react-router"
import { useAuth } from "@/contexts/AuthContext"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, business, businessLoading } = useAuth()
  const location = useLocation()

  if (loading || (session && businessLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  // Redirect to onboarding if business is not yet set up
  const needsOnboarding = !business || business.status === "inactive" || !business.businessType
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />
  }

  // Redirect away from onboarding if already active
  if (!needsOnboarding && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
