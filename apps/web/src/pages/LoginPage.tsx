import { Navigate } from "react-router"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { SocialAuth } from "@/components/auth/SocialAuth"
import { LoginForm } from "@/components/auth/LoginForm"
import { useAuth } from "@/contexts/AuthContext"

export function LoginPage() {
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
      title="Welcome back"
      description="Sign in to your Front Desk account"
    >
      <div className="space-y-4">
        <SocialAuth />
        <LoginForm />
      </div>
    </AuthLayout>
  )
}
