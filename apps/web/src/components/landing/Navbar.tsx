import { Link } from "react-router"
import { Menu } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NAV_LINKS } from "@/constants/landing"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo-v2.png" alt="Front Desk" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-foreground tracking-tight">Front Desk</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA + mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:block"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className={
              buttonVariants({ size: "sm" }) +
              " bg-foreground text-background hover:bg-foreground/80 rounded-lg px-5"
            }
          >
            Get Started
          </Link>

          {/* Mobile hamburger — hidden on md+ */}
          <Sheet>
            <SheetTrigger
              render={
                <button
                  className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background pt-10">
              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/login"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={
                    buttonVariants({ size: "sm" }) +
                    " bg-foreground text-background hover:bg-foreground/80 rounded-lg w-full justify-center"
                  }
                >
                  Get Started
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
