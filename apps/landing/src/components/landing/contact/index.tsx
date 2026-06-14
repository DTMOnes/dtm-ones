// Components
import Section from "@/components/landing/shared/section";
import Button from "@/components/landing/shared/button";
import Reveal from "@/components/landing/shared/reveal";

// Styles
import styles from "./styles.module.scss";

export default function Contact() {
  return (
    <Section id="contact" ariaLabel="Contact">
      <Reveal>
        <div className={styles.wrap}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Get in touch</p>
            <h2 className={styles.title}>Contact us</h2>
            <p className={styles.subtitle}>
              We&apos;re always open to meaningful conversations about
              basketball, careers, and opportunities.
            </p>
          </div>

          <div className={styles.action}>
            <Button href="/contact">Send a message</Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
