"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";

import Button from "./Button";
import Nav from "../Nav";

const subscribeToClient = () => () => {};

export default function Menu() {
  const pathname = usePathname();
  const { chromeOverlay, toggleMenu, closeChromeOverlay } = useHeaderOverride();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const isActive = chromeOverlay === "menu";

  useEffect(() => {
    closeChromeOverlay();
  }, [pathname, closeChromeOverlay]);

  useEffect(() => {
    if (isActive) {
      document.documentElement.dataset.menuOpen = "true";
    } else {
      delete document.documentElement.dataset.menuOpen;
    }

    return () => {
      delete document.documentElement.dataset.menuOpen;
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = buttonRef.current;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeChromeOverlay();
        return;
      }

      if (event.key !== "Tab") return;

      const menuLinks = Array.from(
        document.querySelectorAll<HTMLElement>("#site-menu a[href]"),
      );
      const focusableElements = menuButton
        ? [...menuLinks, menuButton]
        : menuLinks;

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    const focusFrame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("#site-menu a[href]")?.focus();
    });

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [isActive, closeChromeOverlay]);

  return (
    <>
      <Button
        isActive={isActive}
        onClick={toggleMenu}
        buttonRef={buttonRef}
      />
      {mounted
        ? createPortal(
            <AnimatePresence mode="wait">
              {isActive ? (
                <Nav onNavigate={closeChromeOverlay} />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
