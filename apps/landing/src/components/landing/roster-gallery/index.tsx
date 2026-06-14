"use client";

// Next
import Image from "next/image";

// Data
import { rosterGalleryImages } from "@/data/roster-preview";

// Components
import { RevealGroup, RevealItem } from "@/components/landing/shared/reveal";

// Styles
import styles from "./styles.module.scss";

export default function RosterGallery() {
  return (
    <section className={styles.gallery} aria-label="Full roster gallery">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Gallery</p>
        <h1 className={styles.title}>Our roster</h1>
        <p className={styles.lead}>
          Moments from courts, camps, and contracts — the work behind every
          placement.
        </p>
      </header>

      <RevealGroup className={styles.grid}>
        {rosterGalleryImages.map((src, index) => (
          <RevealItem key={src}>
            <figure
              className={`${styles.cell} ${index % 5 === 0 ? styles.cellTall : ""}`}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={src}
                  alt={`Roster gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={styles.image}
                />
              </div>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
