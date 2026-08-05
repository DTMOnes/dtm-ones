"use client";

// Next
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// React
import { useRef } from "react";

// Utils
import { useDebouncedCallback } from "use-debounce";

// Styles
import styles from "./styles.module.scss";

const buttonVariants = {
  initial: {
    opacity: 0.5,
  },
  hover: {
    opacity: 1,
  },
  tap: {
    opacity: 1,
    scale: 0.8,
  },
} as const;

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);

  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <Image
          src="/assets/icons/magnifying-glass-bold-light.svg"
          alt="magnifying glass"
          width={20}
          height={20}
        />
      </div>

      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder="Search by name"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
      />

      <div
        className={styles.icon}
        onClick={() => {
          handleSearch("");
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
      >
        <Image
          src="/assets/icons/x-bold-light.svg"
          alt="Menu"
          width={20}
          height={20}
        />
      </div>
    </div>
  );
}
