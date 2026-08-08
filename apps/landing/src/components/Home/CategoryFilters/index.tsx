"use client";

import { useLayoutEffect } from "react";

import type { FilterItem } from "@/components/Header/Filters";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";

/**
 * Publishes home category filters into the shared header shell.
 * Lives in the home layout so filters stay mounted while the roster grid suspends.
 */
export default function HomeCategoryFilters({
  categories,
}: {
  categories: FilterItem[];
}) {
  const { setCategoryFilters } = useHeaderOverride();
  const categoriesKey = categories.map((category) => category.id).join(",");

  useLayoutEffect(() => {
    setCategoryFilters(categories);
    return () => {
      setCategoryFilters(null);
    };
    // categoriesKey tracks identity; categories itself is read from the latest render.
  }, [categories, categoriesKey, setCategoryFilters]);

  return null;
}
