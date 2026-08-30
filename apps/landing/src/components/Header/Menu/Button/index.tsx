"use client";

import type { Ref } from "react";
import { motion, useReducedMotion } from "motion/react";

import GlassControl from "@/components/GlassControl";

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
    <GlassControl
      ref={buttonRef}
      aria-label={isActive ? "Close menu" : "Open menu"}
      aria-expanded={isActive}
      aria-controls="site-menu"
      onClick={onClick}
    >
      {/* Two-line morph from React Bits Card Nav */}
      <span className="flex w-5 flex-col gap-1.5" aria-hidden>
        <motion.span
          className="block h-[2px] w-full origin-center bg-current"
          animate={{
            y: isActive ? 3.5 : 0,
            rotate: isActive ? 45 : 0,
          }}
          transition={{ duration, ease }}
        />
        <motion.span
          className="block h-[2px] w-full origin-center bg-current"
          animate={{
            y: isActive ? -3.5 : 0,
            rotate: isActive ? -45 : 0,
          }}
          transition={{ duration, ease }}
        />
      </span>
    </GlassControl>
  );
}
