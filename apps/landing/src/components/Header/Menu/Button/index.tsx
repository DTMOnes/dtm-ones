"use client";

import type { Ref } from "react";

import styles from "../styles.module.scss";

export default function Button({
  isActive,
  onClick,
  buttonRef,
}: {
  isActive: boolean;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.menuButton}
      onClick={onClick}
      aria-label={isActive ? "Close menu" : "Open menu"}
      aria-expanded={isActive}
      aria-controls="site-menu"
    >
      <span className={styles.menuLabel}>Menu</span>
      <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden>
        <path
          d="M2 3h18M6 10h18M2 17h18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
