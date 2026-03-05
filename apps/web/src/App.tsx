import { Routes, Route } from "react-router"

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
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/calls" element={<Calls />} />
    </Routes>
  )
}
