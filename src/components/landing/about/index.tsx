"use client";

// Styles
import styles from "./styles.module.scss";

const content = [
  {
    index: "01",
    title: "Built on 25 years of trust",
    description:
      "Since 2000, we've worked without interruption to build something rare — an agency where loyalty and hard work aren't talking points. They're how we operate.",
  },
  {
    index: "02",
    title: "The right opportunity, in the right place",
    description:
      "We connect players and coaches with clubs across the globe, creating pathways that match each athlete's skill level and moment in their career.",
  },
  {
    index: "03",
    title: "Your career, protected.",
    description:
      "Our legal team specializes in FIBA arbitration and players' rights. Every client who works with us has someone in their corner — on and off the court.",
  },
];

export default function About() {
  return (
    <section id="about" className={styles.container}>
      {content.map((item) => (
        <article key={item.index} className={styles.item}>
          <span className={styles.item_index}>{item.index}</span>
          <div className={styles.item_content}>
            <h2 className={styles.item_title}>{item.title}</h2>
            <p className={styles.item_description}>{item.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
