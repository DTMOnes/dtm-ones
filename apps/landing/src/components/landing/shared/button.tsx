import Link from "next/link";

// Styles
import styles from "./button.module.scss";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
