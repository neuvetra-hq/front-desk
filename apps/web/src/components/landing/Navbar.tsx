import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { NAV_LINKS } from "@/constants/landing"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
            <span className="text-sm font-bold text-white">FD</span>
          </div>
          <span className="text-base font-semibold text-neutral-900">Front Desk</span>
        </a>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a href="/login" className="hidden text-sm text-neutral-500 hover:text-neutral-900 md:block">
            Sign in
          </a>
          <Link to="/login" className={buttonVariants({ size: "sm" })}>
            Get Started
          </Link>
        </div>
      </Container>
    </header>
  )
}
