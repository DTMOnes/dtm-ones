import type { Variants } from "motion/react";

export const panelVariants: Variants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.28,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

export const fadeUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
    },
  },
};
