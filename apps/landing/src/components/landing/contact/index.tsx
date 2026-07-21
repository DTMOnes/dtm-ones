// Components
import Form from "./form";

// Styles
import styles from "./styles.module.scss";

export default function Contact() {
  return (
    <section id="contact" className={styles.container}>
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div className={styles.wrapper_content}>
            <h2 className={styles.title}>Contact Us</h2>
            <p className={styles.subtitle}>
              We&apos;re always open to meaningful conversations about
              basketball, careers, and opportunities.
            </p>
          </div>
        </div>

        <Form />
      </div>
    </section>
  );
}
