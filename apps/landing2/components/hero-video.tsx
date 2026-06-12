"use client"

export function HeroVideo() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-background"
      aria-label="Hero"
    >
      {/* Background video with image poster fallback */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-court.png"
      >
        <source
          src="https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Darkening overlays for legibility */}
      <div className="absolute inset-0 bg-background/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-32 md:pb-24">
        <p className="font-heading text-sm font-medium uppercase tracking-[0.35em] text-primary">
          Basketball Talent Agency
        </p>
        <h1 className="mt-4 max-w-4xl text-balance font-heading text-5xl font-bold uppercase leading-[0.9] tracking-tight text-foreground sm:text-7xl lg:text-[8rem]">
          We move at the
          <br />
          <span className="text-primary">speed of the game</span>
        </h1>
        <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          In this game, speed wins. Scout our roster the second you arrive,
          then make the call. The right opportunity rarely waits.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href="#roster"
            className="group inline-flex items-center justify-center gap-3 bg-primary px-8 py-4 font-heading text-base font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            View the Roster
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-3 border border-border px-8 py-4 font-heading text-base font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
          >
            Sign a Player
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 right-6 hidden items-center gap-3 md:flex">
        <span className="font-heading text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Scroll
        </span>
        <span className="h-10 w-px bg-border" />
      </div>
    </section>
  )
}
