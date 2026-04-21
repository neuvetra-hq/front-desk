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
import { ContactPage } from "@/pages/ContactPage"
import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { VoiceCallProvider } from "@/contexts/VoiceCallContext"
import { CallFAB } from "@/components/landing/CallFAB"
import { ScrollToTop } from "@/components/layout/ScrollToTop"
import { GpuRoute } from "@/components/auth/GpuRoute"
import { AppPage } from "@/pages/AppPage"

export function App() {
  return (
    <VoiceCallProvider>
      <ScrollToTop />
      <Routes>
      {/* Marketing routes — share a persistent layout so the call FAB survives navigation */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/industries/:slug" element={<IndustryPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* GPU-gated — publicly accessible, requires WebGPU */}
      <Route path="/app" element={<GpuRoute><AppPage /></GpuRoute>} />

      {/* Auth + legal */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Signup wizard — public */}
      <Route path="/signup" element={<SignupPage />} />

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
      <CallFAB />
    </VoiceCallProvider>
  )
}
