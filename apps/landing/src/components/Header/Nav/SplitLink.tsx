"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.215, 0.61, 0.355, 1] as const;

export default function SplitLink({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) return text;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="inline-block overflow-hidden pb-[0.04em]" aria-hidden>
        {Array.from(text).map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.72,
              delay: delay + index * 0.032,
              ease,
            }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    </>
  );
}
