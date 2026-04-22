import { AppPageShell } from "./AppPageShell"

export function AppGetStartedPage() {
  return (
    <AppPageShell title="Get Started" descriptor="7-day free trial">
      <div className="flex items-center justify-center py-12">
        <p
          className="uppercase"
          style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem', letterSpacing: '0.35em' }}
        >
          Coming soon
        </p>
      </div>
    </AppPageShell>
  )
}
