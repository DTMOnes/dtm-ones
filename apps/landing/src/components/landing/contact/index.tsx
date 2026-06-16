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
          <div className={styles.socials}>
            <p className={styles.title}>Our Socials</p>
            <div className={styles.links}>
              {socials.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={styles.link}
                >
                  {social.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Form />
      </div>
    </section>
  );
}
