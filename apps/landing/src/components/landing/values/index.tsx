"use client";

// Data
import { valuesContent } from "@/data/values";

// Components
import Section from "@/components/landing/shared/section";
import { RevealGroup, RevealItem } from "@/components/landing/shared/reveal";

// Styles
import styles from "./styles.module.scss";

export default function Values() {
  return (
    <Section id="values" ariaLabel="Our values">
      <header className={styles.header}>
        <p className={styles.eyebrow}>What we stand for</p>
        <h2 className={styles.heading}>Built for the long game</h2>
      </header>

      <RevealGroup className={styles.list}>
        {valuesContent.map((item, index) => (
          <RevealItem key={item.index}>
            <article
              className={`${styles.item} ${index % 2 === 1 ? styles.itemOffset : ""}`}
            >
              <span className={styles.index} aria-hidden>
                {item.index}
              </span>
              <div className={styles.content}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
