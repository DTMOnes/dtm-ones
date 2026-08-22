export default function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <svg className="absolute inset-0 size-full opacity-[0.055] mix-blend-overlay">
        <filter id="menu-grain" x="0" y="0">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#menu-grain)" />
      </svg>
    </div>
  );
}
