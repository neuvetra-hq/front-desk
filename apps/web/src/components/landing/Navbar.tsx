import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { NAV_LINKS } from "@/constants/landing"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-neutral-900">Neuvetra</span>
            <span className="text-[10px] text-neutral-400 font-medium">Front Desk</span>
          </div>
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
          <Link to="/login" className="hidden text-sm text-neutral-500 hover:text-neutral-900 md:block">
            Sign in
          </Link>
          <Link to="/signup" className={buttonVariants({ size: "sm" }) + " bg-indigo-600 text-white hover:bg-indigo-700"}>
            Get Started
          </Link>
        </div>
      </Container>
    </header>
  )
}
