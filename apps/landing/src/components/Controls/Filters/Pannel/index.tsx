"use client";

// Next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// React
import { useMemo } from "react";

// Styles
import styles from "./styles.module.scss";

// Types
import { Category } from "@/types/category";
import { label } from "motion/react-client";

export default function FiltersPannel({
  categories,
}: {
  categories: Category[];
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = useMemo(
    () => new Set(searchParams.getAll("c")),
    [searchParams],
  );

  const handleToggle = (id: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.append("c", id);
    } else {
      params.delete("c", id);
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("c");

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      {categories.map((category) => (
        <label key={category.id} htmlFor={category.id} className={styles.label}>
          <input
            className={styles.input}
            id={category.id}
            type="checkbox"
            checked={selected.has(category.id)}
            onChange={(e) => handleToggle(category.id, e.target.checked)}
          />
          <span className={styles.name}>{category.name}</span>
        </label>
      ))}
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}
