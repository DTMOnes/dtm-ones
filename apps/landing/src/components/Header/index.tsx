"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

import InlineNav from "./InlineNav";
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
  overlay = false,
}: {
  search?: ReactNode;
  overlay?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] overflow-visible px-7 group-data-[menu-open]/chrome:z-[1002] group-data-[menu-open]/chrome:bg-transparent",
        overlay
          ? "pointer-events-none bg-transparent pb-0"
          : "bg-background pb-6",
      )}
      style={{ paddingTop: 20 }}
    >
      <motion.div
        className={overlay ? "pointer-events-none" : undefined}
        variants={reduce ? undefined : chromeVariants}
        initial={reduce ? false : "hidden"}
        animate="show"
      >
        <motion.div
          className={cn(
            // Phone: gap-2 keeps search icon ↔ hamburger tight (#49).
            // Desktop: wider column gap in the 3-col grid.
            "flex items-center gap-2 overflow-visible lg:grid lg:grid-cols-[1fr_minmax(0,440px)_1fr] lg:gap-4",
            overlay && "pointer-events-none",
          )}
          variants={reduce ? undefined : itemVariants}
        >
          <div
            className={cn(
              "flex min-w-0 items-center",
              overlay && "pointer-events-auto",
            )}
          >
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

          <div
            className={cn(
              "flex items-center justify-end gap-2 max-lg:ml-auto",
              overlay && "pointer-events-auto",
            )}
          >
            <InlineNav className="hidden nav:flex" />
            <Menu />
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}
