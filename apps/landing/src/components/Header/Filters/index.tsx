"use client";

// Next
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// React
import { useMemo } from "react";

// Motion
import { motion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Types
import { Category } from "@/types/category";

export default function Filters({ categories }: { categories: Category[] }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.get("c");

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (selected === id) {
      params.delete("c");
    } else {
      params.set("c", id);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <p>Categories</p>

      <div className={styles.categories}>
        {categories.map((category) => (
          <label key={category.id} htmlFor={category.id}>
            <input
              type="radio"
              id={category.id}
              name="category"
              checked={selected === category.id}
              onChange={() => handleSelect(category.id)}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>

      <p>24 Results</p>
    </div>
  );
}
