import { Routes, Route, Navigate } from "react-router"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { SignupPage } from "@/pages/SignupPage"
import { AuthCallbackPage } from "@/pages/AuthCallbackPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { TermsPage } from "@/pages/TermsPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { CalendarCallbackPage } from "@/pages/CalendarCallbackPage"
import { IndustryPage } from "@/pages/IndustryPage"

export function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Signup wizard — public */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/industries/:slug" element={<IndustryPage />} />

      {/* Legacy redirect */}
      <Route path="/onboarding" element={<Navigate to="/signup" replace />} />

      {/* Calendar OAuth return — protected (Google + Microsoft + CalDAV) */}
      <Route path="/calendar/callback" element={<ProtectedRoute><CalendarCallbackPage /></ProtectedRoute>} />
      <Route path="/calendar/microsoft/callback" element={<ProtectedRoute><CalendarCallbackPage /></ProtectedRoute>} />
      <Route path="/calendar/caldav/callback" element={<ProtectedRoute><CalendarCallbackPage /></ProtectedRoute>} />

      {/* Protected — /dashboard redirects to /dashboard/overview */}
      <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/overview" replace /></ProtectedRoute>} />
      <Route path="/dashboard/:tab" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    </Routes>
  )
}
