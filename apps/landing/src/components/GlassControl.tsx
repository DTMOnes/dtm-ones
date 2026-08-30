"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlassControlProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** icon = media circle; soft = header soft-square; pill = labeled (Info). */
  variant?: "icon" | "soft" | "pill";
  /** Filter/search URL badge (white dot). Not the same as aria-expanded. */
  active?: boolean;
  children: ReactNode;
};

const GlassControl = forwardRef<HTMLButtonElement, GlassControlProps>(
  function GlassControl(
    {
      variant = "icon",
      active = false,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "glass-control",
          variant === "pill"
            ? "glass-control--pill"
            : variant === "soft"
              ? "glass-control--soft"
              : "glass-control--icon",
          className,
        )}
        data-active={active ? "true" : undefined}
        {...props}
      >
        {children}
        {active ? (
          <span className="glass-control__badge" aria-hidden />
        ) : null}
      </button>
    );
  },
);

export default GlassControl;
