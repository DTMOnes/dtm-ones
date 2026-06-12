"use client"

import Image from "next/image"
import type { Player } from "@/lib/players"

export function PlayerCard({
  player,
  index,
}: {
  player: Player
  index: number
}) {
  return (
    <article className="group relative aspect-[3/4] overflow-hidden bg-card">
      <Image
        src={player.image || "/placeholder.svg"}
        alt={`Portrait of ${player.name}`}
        fill
        sizes="(max-width: 640px) 260px, 300px"
        className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
        priority={index < 3}
      />

      {/* Number */}
      <span className="absolute left-3 top-3 font-heading text-5xl font-bold leading-none text-foreground/80 mix-blend-overlay">
        {player.number}
      </span>

      {/* Gradient + meta */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-4 pt-12">
        <p className="font-heading text-xs font-medium uppercase tracking-widest text-primary">
          {player.position}
        </p>
        <h3 className="font-heading text-2xl font-bold uppercase leading-tight tracking-tight text-foreground">
          {player.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
          {player.team}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 border-2 border-transparent transition-colors duration-300 group-hover:border-primary" />
    </article>
  )
}
