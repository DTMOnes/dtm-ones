import type { CSSProperties } from "react";
import Image from "next/image";

import {
  LETTER_CONTOURS,
  LETTERS_PATH,
  LOGO_BOX,
  STAR_CENTER,
  STAR_PATH,
} from "./logo-paths";
import styles from "./styles.module.scss";

// ponytail: four stills crossfade as a placeholder reel; swap for
// <video autoplay muted loop playsInline poster> once the agency has the clip.
const SHOTS = [
  // Wide shot: on phones it is shown whole (letterboxed) instead of cropped.
  {
    src: "/assets/hero/hero-gimnasia-2.jpg",
    position: "30% 40%",
    wholeOnMobile: true,
  },
  { src: "/assets/hero/hero-2.jpg", position: "55% 45%" },
  // Wide shot of one player: framed and zoomed per screen width in styles (.shotMineros).
  { src: "/assets/hero/hero-mineros.webp", className: styles.shotMineros },
  // Portrait shot: framed knees-up per screen width in styles (.shotMarinos).
  { src: "/assets/hero/hero-marinos.jpg", className: styles.shotMarinos },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.reel} aria-hidden>
        {SHOTS.map((shot, index) => (
          <Image
            key={shot.src}
            className={[
              styles.shot,
              "wholeOnMobile" in shot ? styles.shotWhole : "",
              "className" in shot ? shot.className : "",
            ].join(" ")}
            src={shot.src}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            style={"position" in shot ? { objectPosition: shot.position } : undefined}
          />
        ))}
        <div className={styles.dim} />
        <div className={styles.fade} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className="sr-only">DTMones</span>
          {/* The ball's star lands first; then the outline draws around it and fills in. */}
          <svg
            className={styles.logo}
            viewBox={`${LOGO_BOX.x} ${LOGO_BOX.y} ${LOGO_BOX.w} ${LOGO_BOX.h}`}
            aria-hidden
          >
            <path
              className={styles.logoFill}
              d={LETTERS_PATH}
              fillRule="evenodd"
            />
            <g className={styles.logoLines}>
              {LETTER_CONTOURS.map((contour) => (
                <path
                  key={contour.d.slice(0, 24)}
                  d={contour.d}
                  pathLength={1}
                />
              ))}
            </g>
            <path
              className={styles.logoStar}
              d={STAR_PATH}
              style={
                {
                  "--star-dx": `${LOGO_BOX.x + LOGO_BOX.w / 2 - STAR_CENTER.x}px`,
                  "--star-dy": `${LOGO_BOX.y + LOGO_BOX.h / 2 - STAR_CENTER.y}px`,
                } as CSSProperties
              }
            />
          </svg>
        </h1>
        <p className={styles.sub}>
          <span className={styles.rule} aria-hidden />
          Player representation
          <span className={styles.rule} aria-hidden />
        </p>
        <p className={styles.tagline}>
          The line of your <span>Dreams</span>.
        </p>
      </div>

      <a
        className={styles.chevron}
        href="#roster"
        aria-label="Scroll to clients"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
