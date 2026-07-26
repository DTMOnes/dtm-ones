"use client";

// React
import { useEffect, useState } from "react";

// Next
import { usePathname } from "next/navigation";

// Styles
import styles from "./styles.module.scss";

function isInternalNavLink(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      return false;
    }

    const nextPath = `${url.pathname}${url.search}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    return nextPath !== currentPath;
  } catch {
    return false;
  }
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(false);
  }, [pathname]);

  useEffect(() => {
    if (!isPending) return;

    const timeoutId = window.setTimeout(() => {
      setIsPending(false);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [isPending]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavLink(anchor)) return;

      setIsPending(true);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      className={styles.track}
      data-pending={isPending ? "true" : "false"}
      aria-hidden={!isPending}
    >
      <div className={styles.bar} />
    </div>
  );
}
