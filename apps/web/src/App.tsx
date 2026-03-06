import { Routes, Route } from "react-router"
import { LandingPage } from "@/pages/LandingPage"

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  )
}

function Login() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Login</h1>
    </div>
  )
}

function Calls() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Call History</h1>
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calls" element={<Calls />} />
    </Routes>
  )
}
