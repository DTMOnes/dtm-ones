"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/**
 * Wraps children and translates them vertically based on scroll position,
 * creating a parallax effect. `speed` controls intensity and direction:
 * negative values move slower/up, positive values move faster/down.
 */
export function Parallax({
  children,
  speed = -0.2,
  className,
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (prefersReduced) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight
      // Distance of element center from viewport center, normalized.
      const fromCenter = rect.top + rect.height / 2 - viewportH / 2
      setOffset(fromCenter * speed)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [speed])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${offset}px, 0)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  )
}
