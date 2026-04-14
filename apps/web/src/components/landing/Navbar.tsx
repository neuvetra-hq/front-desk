import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { NAV_LINKS } from "@/constants/landing"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Front Desk" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-neutral-900 tracking-tight">Front Desk</span>
        </a>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden text-sm font-medium text-neutral-500 hover:text-neutral-900 md:block">
            Sign in
          </Link>
          <Link
            to="/signup"
            className={buttonVariants({ size: "sm" }) + " bg-neutral-900 text-white hover:bg-neutral-700 rounded-lg px-5"}
          >
            Get Started
          </Link>
        </div>
      </Container>
    </header>
  )
}
