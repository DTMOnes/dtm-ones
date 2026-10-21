"use client";

import { useState, type CSSProperties } from "react";
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
  { src: "/assets/hero/hero-4.jpg", position: "55% 40%" },
  { src: "/assets/hero/hero-manama.jpg", position: "55% 30%" },
];

export default function Hero() {
  const [paused, setPaused] = useState(false);

  return (
    <section className={styles.hero}>
      <div
        className={`${styles.reel} ${paused ? styles.paused : ""}`}
        aria-hidden
      >
        {SHOTS.map((shot, index) => (
          <Image
            key={shot.src}
            className={
              "wholeOnMobile" in shot
                ? `${styles.shot} ${styles.shotWhole}`
                : styles.shot
            }
            src={shot.src}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            style={{ objectPosition: shot.position }}
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

      <button
        type="button"
        className={styles.pause}
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Play background reel" : "Pause background reel"}
        aria-pressed={paused}
      >
        {paused ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7 4v16l13-8z" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        )}
      </button>
    </section>
  );
}
