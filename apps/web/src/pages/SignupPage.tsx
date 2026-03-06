import { Navigate } from "react-router"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { SocialAuth } from "@/components/auth/SocialAuth"
import { SignupForm } from "@/components/auth/SignupForm"
import { useAuth } from "@/contexts/AuthContext"

export function SignupPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    )
  }

  if (session) return <Navigate to="/dashboard" replace />

  return (
    <AuthLayout
      title="Create your account"
      description="Get your AI front desk up and running in minutes"
    >
      <div className="space-y-4">
        <SocialAuth />
        <SignupForm />
      </div>
    </AuthLayout>
  )
}
