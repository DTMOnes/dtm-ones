"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { isNavCurrent, overlayPages } from "./nav-data";

export default function InlineNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("glass-nav-plate", className)}
      aria-label="Primary"
    >
      {overlayPages.map((page) => {
        const isCurrent = isNavCurrent(pathname, page.href);

        return (
          <Link
            key={page.href}
            href={page.href}
            className={cn(
              "text-[length:var(--meta-size)] font-normal tracking-[var(--meta-tracking)] text-white uppercase transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isCurrent ? "opacity-100" : "opacity-[0.32] hover:opacity-100 focus-visible:opacity-100",
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}
