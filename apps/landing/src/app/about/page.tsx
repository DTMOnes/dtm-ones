import type { Metadata } from "next";

import styles from "./styles.module.scss";

const paragraphs = [
  "Since 2000, DTM Ones has worked without interruption to build something rare in this industry. Not a loud brand. Not a short-term hustle. An agency where loyalty and hard work are not talking points, but the way we operate every single day.",
  "Over twenty-five years, that approach has become our reputation. Players, coaches, and clubs know what to expect when they work with us: clear communication, long-term thinking, and people who stay in the conversation when things get complicated.",
  "Our work is to find the right opportunity in the right place. We connect athletes and coaches with clubs across the globe, shaping competitive pathways that fit skill level, ambition, and the moment someone is living in their career.",
  "That means listening first. Understanding where someone wants to go. Then building a path that protects both the present and what comes next.",
  "Behind every move is a legal team that specializes in FIBA arbitration and players' rights. Contracts, disputes, and the details that can change a career are handled with the same care we bring to the court.",
  "Every client who works with us has someone in their corner — on and off the court. That is the standard we set for ourselves, and the reason talent continues to trust the name.",
];

export const metadata: Metadata = {
  title: "About | DTM Ones",
  description:
    "Learn how DTM Ones supports basketball players and coaches worldwide.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>About us</h1>

        <div className={styles.content}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}
