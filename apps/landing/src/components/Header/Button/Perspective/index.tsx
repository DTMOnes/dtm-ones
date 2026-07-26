"use client";

// Next
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

export default function Perspective({ icon }: { icon: string }) {
  return (
    <div className={styles.perspective}>
      <Image
        src={icon}
        alt="Perspective"
        width={24}
        height={24}
        className={styles.icon}
      />
      <Image
        src={icon}
        alt="Perspective"
        width={24}
        height={24}
        className={styles.icon}
      />
    </div>
  );
}
