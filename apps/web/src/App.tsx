import { Routes, Route } from "react-router"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"
import { AuthCallbackPage } from "@/pages/AuthCallbackPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { OnboardingPage } from "@/pages/OnboardingPage"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    </Routes>
  )
}
