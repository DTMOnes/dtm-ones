"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

import Logo from "./Logo";
import Menu from "./Menu";

const easeOut = [0.16, 1, 0.3, 1] as const;

const chromeVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export default function Header({
  search,
  filters,
  overlay = false,
}: {
  search?: ReactNode;
  filters?: ReactNode;
  overlay?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] overflow-visible px-7 group-data-[menu-open]/chrome:z-[1002] group-data-[menu-open]/chrome:bg-transparent",
        overlay ? "bg-transparent pb-0" : "bg-background pb-10",
      )}
      style={{ paddingTop: 20 }}
    >
      <motion.div
        variants={reduce ? undefined : chromeVariants}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.div
          className="flex items-center gap-4 overflow-visible lg:grid lg:grid-cols-[1fr_minmax(0,440px)_1fr]"
          variants={reduce ? undefined : itemVariants}
        >
          <div className="flex min-w-0 items-center">
            <Logo />
          </div>

          <div
            className={cn(
              "min-w-0 group-data-[menu-open]/chrome:pointer-events-none group-data-[menu-open]/chrome:invisible",
              search ? "max-lg:flex-1" : "max-lg:hidden",
            )}
          >
            {search}
          </div>

          <div className="flex items-center justify-end max-lg:ml-auto">
            <Menu />
          </div>
        </motion.div>

        {filters ? (
          <motion.div
            className="group-data-[menu-open]/chrome:pointer-events-none group-data-[menu-open]/chrome:invisible"
            style={{ marginTop: 40 }}
            variants={reduce ? undefined : itemVariants}
          >
            {filters}
          </motion.div>
        ) : null}
      </motion.div>
    </header>
  );
}
