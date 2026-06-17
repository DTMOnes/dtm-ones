// Next
import Link from "next/link";
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

// Icons
import {
  InstagramLogoIcon,
  FacebookLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/team_dallas_starz/",
    icon: <InstagramLogoIcon size={24} color="#ffffff" />,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/team_dallas_starz/",
    icon: <FacebookLogoIcon size={24} color="#ffffff" />,
  },
  {
    name: "Youtube",
    href: "https://www.youtube.com/channel/UC_x-kSZnf_bQxzBsiAhIpwQ",
    icon: <YoutubeLogoIcon size={24} color="#ffffff" />,
  },
];
export default function Footer() {
  return (
    <footer className={styles.container}>
      <Image
        src="/assets/dtm-ones-logo.svg"
        alt="DTM ONES Logo"
        width={1000}
        height={1000}
        className={styles.background_logo}
      />
      <div className={styles.background_blob} />

      <div className={styles.content}>
        <span>&copy; 2026 DTM ONES. All rights reserved.</span>

        <div className={styles.social_links}>
          {socials.map((social) => (
            <Link href={social.href} key={social.name}>
              {social.icon}
            </Link>
          ))}
        </div>

        <div className={styles.links}>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
}
