"use client"

import { Parallax } from "@/components/parallax"

export function ContactFooter() {
  return (
    <footer
      id="contact"
      className="relative scroll-mt-24 overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <p className="font-heading text-sm font-medium uppercase tracking-[0.35em] text-primary">
          Contact
        </p>
        <h2 className="mt-3 max-w-4xl text-balance font-heading text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl">
          Ready to make your next move?
        </h2>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="mailto:scout@baseline.agency"
            className="inline-flex items-center justify-center bg-primary px-8 py-4 font-heading text-base font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Sign a Player
          </a>
          <a
            href="#roster"
            className="inline-flex items-center justify-center border border-border px-8 py-4 font-heading text-base font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
          >
            View Roster
          </a>
        </div>

        <div className="mt-16 grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
          <div>
            <p className="font-heading text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Email
            </p>
            <p className="mt-1 text-foreground">scout@baseline.agency</p>
          </div>
          <div>
            <p className="font-heading text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Phone
            </p>
            <p className="mt-1 text-foreground">+1 (555) 028-1991</p>
          </div>
          <div>
            <p className="font-heading text-xs font-medium uppercase tracking-widest text-muted-foreground">
              HQ
            </p>
            <p className="mt-1 text-foreground">Los Angeles, CA</p>
          </div>
        </div>
      </div>

      {/* Oversized parallax wordmark */}
      <Parallax speed={-0.12} className="pointer-events-none">
        <span className="block select-none px-6 text-center font-heading text-[24vw] font-bold uppercase leading-[0.7] tracking-tighter text-foreground">
          Baseline
        </span>
      </Parallax>

      <div className="border-t border-border py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs uppercase tracking-widest text-muted-foreground sm:flex-row">
          <span>© 2026 Baseline Talent Agency</span>
          <span>Demo content — built with v0</span>
        </div>
      </div>
    </footer>
  )
}
