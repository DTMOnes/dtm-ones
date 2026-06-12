"use client"

import { players } from "@/lib/players"
import { PlayerCard } from "@/components/player-card"

export function RosterSection() {
  return (
    <section
      id="roster"
      className="relative scroll-mt-24 overflow-hidden border-t border-border bg-background py-20 md:py-28"
      aria-label="Roster"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Headline */}
        <div className="flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-heading text-sm font-medium uppercase tracking-[0.35em] text-primary">
              The Roster
            </p>
            <h2 className="mt-3 max-w-3xl text-balance font-heading text-5xl font-bold uppercase leading-[0.92] tracking-tight text-foreground sm:text-7xl">
              Meet the
              <br />
              <span className="text-primary">talent</span>
            </h2>
          </div>
          <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground md:text-right">
            We put our players in front of you the second you arrive. Scroll the
            rail, scout the talent, make the call.
          </p>
        </div>

        {/* Roster rail */}
        <div>
          <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-heading text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {players.length} Athletes Represented
            </span>
            <span className="font-heading text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Drag / Scroll →
            </span>
          </div>

          <div className="-mx-6 overflow-x-auto px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex gap-4">
              {players.map((player, i) => (
                <li key={player.id} className="w-[260px] shrink-0 sm:w-[300px]">
                  <PlayerCard player={player} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
