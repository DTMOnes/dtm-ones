// Next
import Link from "next/link";

// Components
import Form from "./form";

// Styles
import styles from "./styles.module.scss";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/team_dallas_starz/",
  },

  {
    name: "Facebook",
    href: "https://www.facebook.com/team_dallas_starz/",
  },
  {
    name: "Youtube",
    href: "https://www.youtube.com/channel/UC_x-kSZnf_bQxzBsiAhIpwQ",
  },
];

export default function Contact() {
  return (
    <section className={styles.container}>
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
