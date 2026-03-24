import { Container } from "@/components/layout/Container"
import { FOOTER } from "@/constants/landing"

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white py-16">
      <Container>
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900">
                <span className="text-sm font-black text-white">N</span>
              </div>
              <span className="text-lg font-bold text-neutral-900 tracking-tight">Neuvetra</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">{FOOTER.tagline}</p>
            <p className="mt-4 text-xs text-neutral-400">Birgani Enterprises Inc.</p>
          </div>

          {/* Link columns */}
          {FOOTER.columns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-neutral-100 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-neutral-400">{FOOTER.copyright}</p>
          <p className="text-xs text-neutral-400">Powered by Twilio · Retell AI · OpenAI</p>
        </div>
      </Container>
    </footer>
  )
}
