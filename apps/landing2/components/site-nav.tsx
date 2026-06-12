"use client"

import { useEffect, useState } from "react"

const links = [
  { label: "Roster", href: "#roster" },
  { label: "About", href: "#about" },
  { label: "Edge", href: "#edge" },
  { label: "Contact", href: "#contact" },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground"
        >
          Base<span className="text-primary">line</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-heading text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="font-heading text-sm font-semibold uppercase tracking-widest text-primary-foreground"
        >
          <span className="inline-flex items-center bg-primary px-4 py-2 transition-transform hover:-translate-y-0.5">
            Sign a Player
          </span>
        </a>
      </nav>
    </header>
  )
}
