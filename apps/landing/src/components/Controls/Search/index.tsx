"use client";

// Next
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// React
import { useRef } from "react";

// Motion
import { motion } from "motion/react";

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
      <motion.div
        variants={buttonVariants}
        animate={inputRef.current?.value ? "hover" : "initial"}
        transition={{ duration: 0.3 }}
      >
        <Image
          src="/assets/icons/magnifying-glass-bold-light.svg"
          alt="magnifying glass"
          width={24}
          height={24}
        />
      </motion.div>

      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder="Search by name"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
      />

      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.3 }}
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
          width={24}
          height={24}
        />
      </motion.div>
    </div>
  );
}
