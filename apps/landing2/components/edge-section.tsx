"use client"

import { TrendingUp, ShieldCheck, Globe, Megaphone } from "lucide-react"

const services = [
  {
    icon: TrendingUp,
    title: "Contract Negotiation",
    body: "We sit at the table so you stay on the court. Maximum value, zero distractions.",
  },
  {
    icon: ShieldCheck,
    title: "Career Management",
    body: "Long-term planning, injury contingency, and transitions handled end to end.",
  },
  {
    icon: Globe,
    title: "Global Placement",
    body: "From the draft to overseas leagues, we open doors across 18 countries.",
  },
  {
    icon: Megaphone,
    title: "Brand & Media",
    body: "Endorsements, social, and press that build a name beyond the box score.",
  },
]

export function EdgeSection() {
  return (
    <section
      id="edge"
      className="scroll-mt-24 border-b border-border bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="font-heading text-sm font-medium uppercase tracking-[0.35em] text-primary">
            The Edge
          </p>
          <h2 className="mt-3 text-balance font-heading text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl">
            Built for the fast break
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-card p-8 transition-colors hover:bg-secondary"
            >
              <service.icon
                className="size-8 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="mt-6 font-heading text-xl font-semibold uppercase tracking-tight text-foreground">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
