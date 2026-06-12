"use client"

import Image from "next/image"
import { Parallax } from "@/components/parallax"

const principles = [
  {
    no: "01",
    title: "Built on 25 years of trust",
    body: "Since 2000, we've worked without interruption to build something rare — an agency where loyalty and hard work aren't talking points. They're how we operate.",
  },
  {
    no: "02",
    title: "The right opportunity, in the right place",
    body: "We connect players and coaches with clubs across the globe, creating pathways that match each athlete's skill level and moment in their career.",
  },
  {
    no: "03",
    title: "Your career, protected.",
    body: "Our legal team specializes in FIBA arbitration and players' rights. Every client who works with us has someone in their corner — on and off the court.",
  },
]

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden border-t border-border bg-background py-24 md:py-32"
      aria-label="About"
    >
      {/* Parallax oversized background word */}
      <Parallax
        speed={-0.18}
        className="pointer-events-none absolute -right-10 top-10 select-none"
      >
        <span className="font-heading text-[18vw] font-bold uppercase leading-none tracking-tight text-secondary/40">
          Since 2000
        </span>
      </Parallax>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          {/* Sticky heading + parallax image */}
          <div className="md:sticky md:top-28">
            <p className="font-heading text-sm font-medium uppercase tracking-[0.35em] text-primary">
              About Baseline
            </p>
            <h2 className="mt-3 text-balance font-heading text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl">
              Loyalty is our
              <br />
              <span className="text-primary">game plan</span>
            </h2>

            <div className="relative mt-8 h-[260px] w-full overflow-hidden sm:h-[340px]">
              <Parallax speed={-0.12} className="absolute inset-x-0 -top-10 h-[130%]">
                <Image
                  src="/players/player-3.png"
                  alt="Represented athlete in studio portrait"
                  fill
                  sizes="40vw"
                  className="object-cover grayscale"
                />
              </Parallax>
              <div className="absolute inset-0 border-4 border-primary" />
            </div>
          </div>

          {/* Principles */}
          <ol className="flex flex-col">
            {principles.map((p) => (
              <li
                key={p.no}
                className="border-t border-border py-8 first:border-t-0 first:pt-0"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-heading text-2xl font-bold tabular-nums text-primary">
                    {p.no}
                  </span>
                  <span className="h-px flex-1 translate-y-[-0.4rem] bg-border" />
                </div>
                <h3 className="mt-4 text-balance font-heading text-2xl font-semibold uppercase tracking-tight text-foreground sm:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
