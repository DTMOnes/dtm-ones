// Next
import Link from "next/link";
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

export default function Logo({ title = "DTM ONES" }: { title?: string }) {
  return (
    <Link href="/" className={styles.container}>
      <Image
        className={styles.image}
        src="/assets/dtm-ones-logo.svg"
        alt="Logo"
        width={30}
        height={25}
      />
      <span className={styles.text}>{title}</span>
    </Link>
  );
}
