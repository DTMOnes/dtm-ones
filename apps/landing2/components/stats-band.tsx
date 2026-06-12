"use client"

import { Parallax } from "@/components/parallax"

const stats = [
  { value: "120+", label: "Deals Closed" },
  { value: "18", label: "Countries" },
  { value: "$340M", label: "Contracts Negotiated" },
  { value: "24/7", label: "Athlete Support" },
]

export function StatsBand() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-primary py-16">
      {/* Parallax oversized wordmark */}
      <Parallax
        speed={0.3}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="select-none font-heading text-[28vw] font-bold uppercase leading-none tracking-tighter text-primary-foreground/10">
          Baseline
        </span>
      </Parallax>

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-heading text-4xl font-bold uppercase tracking-tight text-primary-foreground sm:text-6xl">
              {stat.value}
            </p>
            <p className="mt-1 font-heading text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
