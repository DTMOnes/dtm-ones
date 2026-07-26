"use client";

// React
import { useEffect, useRef, useState } from "react";

// Next
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Motion
import { motion, AnimatePresence } from "motion/react";

// Utils
import { useDebouncedCallback } from "use-debounce";

// Styles
import styles from "./styles.module.scss";

export default function Search({ hidden }: { hidden: boolean }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(searchParams.get("q") !== null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const commit = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = value.trim();

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleToggle = () => {
    if (isOpen) {
      inputRef.current?.focus();
      return;
    }
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    commit.cancel();

    if (searchParams.has("q")) {
      const params = new URLSearchParams(searchParams);
      params.delete("q");
      replace(`${pathname}?${params.toString()}`);
    }
  };

  const className = [
    styles.search,
    isOpen ? styles.open : "",
    hidden ? styles.hidden : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.toggle}
        onClick={handleToggle}
        aria-label="Search players by name"
        tabIndex={isOpen ? -1 : 0}
      >
        <Image
          className={styles.icon}
          src="/assets/icons/magnifying-glass-bold-light.svg"
          alt=""
          width={24}
          height={24}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.field}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.35, delay: 0.2 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Search by name"
              maxLength={50}
              defaultValue={searchParams.get("q") ?? ""}
              onChange={(e) => commit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancel();
                if (e.key === "Enter") commit.flush();
              }}
            />
            <button
              type="button"
              className={styles.cancel}
              onClick={handleCancel}
              aria-label="Cancel search"
            >
              <Image
                className={styles.icon}
                src="/assets/icons/x-bold-light.svg"
                alt=""
                width={20}
                height={20}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
