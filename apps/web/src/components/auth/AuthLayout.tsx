import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface AuthLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900">
            <span className="text-sm font-bold text-white">FD</span>
          </div>
          <span className="text-lg font-semibold text-neutral-900">Front Desk</span>
        </div>

        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="pb-4 text-center">
            <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-500">{description}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
