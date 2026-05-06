"use client";

// Next
import Image from "next/image";

// React
import { useRef } from "react";

// Motion
import { motion, MotionValue, useTransform, useScroll } from "motion/react";

// Hooks
import { useDimension } from "@/hooks/use-dimension";

// Styles
import styles from "./styles.module.scss";

const images = [
  "/assets/images/1.jpeg",
  "/assets/images/2.jpg",
  "/assets/images/3.jpg",
  "/assets/images/4.jpg",
  "/assets/images/5.jpg",
  "/assets/images/6.png",
  "/assets/images/7.png",
  "/assets/images/8.jpg",
  "/assets/images/9.webp",
  "/assets/images/10.jpg",
  "/assets/images/11.jpeg",
  "/assets/images/12.png",
];

const MOBILE_MAX = 768;

export default function Roster() {
  const container = useRef(null);
  const { width, height } = useDimension();
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  return (
    <section id="roster" className={styles.section}>
      <div className={styles.spacer}></div>
      <div ref={container} className={styles.gallery}>
        <Column images={[images[0], images[1], images[2]]} y={y} />
        <Column images={[images[3], images[4], images[5]]} y={y2} />
        <Column images={[images[6], images[7], images[8]]} y={y3} />
        {width > MOBILE_MAX && (
          <Column images={[images[9], images[10], images[11]]} y={y4} />
        )}
      </div>
      <div className={styles.spacer}></div>
    </section>
  );
}

function Column({ images, y }: { images: string[]; y: MotionValue<number> }) {
  return (
    <motion.div style={{ y }} className={styles.column}>
      {images.map((src, index) => (
        <div key={index} className={styles.imageContainer}>
          <Image src={src} alt={src} fill />
        </div>
      ))}
    </motion.div>
  );
}
