"use client";

// React
import { useRef } from "react";

// Motion
import { motion, useScroll, useTransform } from "motion/react";

// Components
import BasketballCourt from "./basketball-court";

// Styles
import styles from "./styles.module.scss";

const content = [
  {
    title: "Built on 25 years of trust",
    description:
      "Since 2000, we've worked without interruption to build something rare — an agency where loyalty and hard work aren't talking points. They're how we operate.",
  },
  {
    title: "The right opportunity, in the right place",
    description:
      "We connect players and coaches with clubs across the globe, creating pathways that match each athlete's skill level and moment in their career.",
  },
  {
    title: "Your career, protected.",
    description:
      "Our legal team specializes in FIBA arbitration and players' rights. Every client who works with us has someone in their corner — on and off the court.",
  },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      id="about"
      ref={ref}
      className={styles.container}
      aria-label="About"
    >
      <div className={styles.court} aria-hidden="true">
        <motion.div className={styles.court_motion} style={{ y }}>
          <BasketballCourt className={styles.court_svg} />
        </motion.div>
      </div>

      {content.map((item, index) => (
        <div key={index} className={styles.item}>
          <span className={styles.index}>0{index + 1}</span>
          <div className={styles.content}>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.description}>{item.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
