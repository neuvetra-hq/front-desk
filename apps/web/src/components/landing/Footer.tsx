import { Container } from "@/components/layout/Container"
import { FOOTER } from "@/constants/landing"

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-16">
      <Container>
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                <span className="text-sm font-bold text-white">FD</span>
              </div>
              <span className="text-base font-semibold text-neutral-900">Front Desk</span>
            </div>
            <p className="mt-4 text-sm text-neutral-500">{FOOTER.tagline}</p>
          </div>

          {/* Link columns */}
          {FOOTER.columns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 text-sm font-semibold text-neutral-900">{col.heading}</h4>
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

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <p className="text-sm text-neutral-400">{FOOTER.copyright}</p>
        </div>
      </Container>
    </footer>
  )
}
