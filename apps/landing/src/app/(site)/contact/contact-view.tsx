import Image from "next/image";

import { StarIcon } from "@/components/icons";

import ContactForm from "./contact-form";
import styles from "./styles.module.scss";

export default function ContactView() {
  return (
    <main className={styles.container}>
      <div className={styles.media}>
        <Image
          className={styles.photo}
          src="/assets/images/contact-dunk.jpg"
          alt="A player dunking during a game"
          fill
          sizes="(width < 1000px) 100vw, 42vw"
          priority
        />
        <div className={styles.tint} aria-hidden />
        <div className={styles.shade} aria-hidden />
        <div className={styles.caption}>
          <StarIcon size={34} />
          <p>
            The line of <br />
            your dreams
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.inner}>
          <p className="kicker">Get in touch</p>
          <h1 className={styles.title}>Contact us</h1>
          <p className={styles.lede}>Players, coaches and clubs — write to us.</p>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
