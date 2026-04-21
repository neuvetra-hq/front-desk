import { useWebGPU } from "@/hooks/useWebGPU"
import { useAuth } from "@/contexts/AuthContext"

export function AppPage() {
  const { adapter } = useWebGPU()
  const { isAuthenticated, session } = useAuth()

  const vendor = adapter?.info.vendor || "unknown"
  const architecture = adapter?.info.architecture || "unknown"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">/app</h1>
      <p>WebGPU is available</p>
      <p>
        GPU: {vendor} / {architecture}
      </p>
      <p>
        {isAuthenticated
          ? `Logged in as: ${session?.user?.email}`
          : "Anonymous user"}
      </p>
    </div>
  )
}
