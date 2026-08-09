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
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: [0.76, 0, 0.24, 1],
      when: "afterChildren",
    },
  },
};

export const mediaVariants: Variants = {
  initial: {
    scale: 0.82,
    opacity: 0.2,
  },
  enter: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    scale: 1.06,
    opacity: 0.15,
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

export const linkVariants: Variants = {
  initial: {
    opacity: 0.08,
    y: 36,
  },
  enter: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.18 + index * 0.09,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: 16,
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
