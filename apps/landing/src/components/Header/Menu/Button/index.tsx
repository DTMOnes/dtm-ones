"use client";

import type { Ref } from "react";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.76, 0, 0.24, 1] as const;

export default function Button({
  isActive,
  onClick,
  buttonRef,
}: {
  isActive: boolean;
  onClick: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : 0.35;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      className="relative flex size-11 cursor-pointer items-center justify-center text-white outline-none transition-opacity duration-200 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-white/50"
      onClick={onClick}
      aria-label={isActive ? "Close menu" : "Open menu"}
      aria-expanded={isActive}
      aria-controls="site-menu"
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={{ duration: 0.2 }}
    >
      {/* Two-line morph from React Bits Card Nav */}
      <span className="flex w-6 flex-col gap-1.5" aria-hidden>
        <motion.span
          className="block h-[2.5px] w-full origin-center bg-current"
          animate={{
            y: isActive ? 4.25 : 0,
            rotate: isActive ? 45 : 0,
          }}
          transition={{ duration, ease }}
        />
        <motion.span
          className="block h-[2.5px] w-full origin-center bg-current"
          animate={{
            y: isActive ? -4.25 : 0,
            rotate: isActive ? -45 : 0,
          }}
          transition={{ duration, ease }}
        />
      </span>
    </motion.button>
  );
}
