import { Container } from "@/components/layout/Container"
import { INDUSTRIES } from "@/constants/landing"

export function Industries() {
  return (
    <section id="industries" className="bg-background py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Industries</p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Built for the businesses<br />that keep communities running.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            If your phone rings and missing it costs you money, Neuvetra is for you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {INDUSTRIES.map(({ label, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 text-center transition-all hover:border-primary/20 hover:bg-primary/5"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
