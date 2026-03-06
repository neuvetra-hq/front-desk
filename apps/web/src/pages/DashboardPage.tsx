import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-neutral-500">Signed in as {user?.email}</p>
      <Button variant="outline" onClick={signOut}>Sign out</Button>
    </div>
  )
}
