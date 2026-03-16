import { Navigate } from "react-router"

// Signup is now handled by the phone OTP flow on the login page
export function SignupPage() {
  return <Navigate to="/login" replace />
}
