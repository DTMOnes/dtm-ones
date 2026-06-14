"use client";

// Next
import Image from "next/image";
import Link from "next/link";

// Data
import { rosterPreviewPlayers } from "@/data/roster-preview";

// Components
import Section from "@/components/landing/shared/section";
import Button from "@/components/landing/shared/button";
import Reveal, { RevealGroup, RevealItem } from "@/components/landing/shared/reveal";

// Styles
import styles from "./styles.module.scss";

export default function RosterPreview() {
  return (
    <Section id="roster" ariaLabel="Roster preview">
      <Reveal className={styles.header}>
        <p className={styles.eyebrow}>Represented talent</p>
        <h2 className={styles.heading}>Meet our roster</h2>
        <p className={styles.lead}>
          A snapshot of athletes we place across leagues worldwide — each
          career managed with the same standard of care.
        </p>
      </Reveal>

      <RevealGroup className={styles.track}>
        {rosterPreviewPlayers.map((player) => (
          <RevealItem key={player.name}>
            <article className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={player.image}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 75vw, 280px"
                  className={styles.image}
                />
                <div className={styles.overlay} aria-hidden />
              </div>
              <div className={styles.meta}>
                <h3 className={styles.name}>{player.name}</h3>
                <p className={styles.position}>{player.position}</p>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className={styles.footer}>
        <Button href="/roster">View full roster</Button>
        <Link href="/roster" className={styles.textLink}>
          Browse all represented players
        </Link>
      </div>
    </Section>
  );
}
