"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  normalizeRosterCategories,
  normalizeRosterQ,
} from "@/lib/roster/search-params";
import type { CategoryWithCount } from "@/types/category";

import styles from "./roster-filter.module.scss";

const DEBOUNCE_MS = 300;
const Q_PARAM = "q";
const C_PARAM = "c";

type RosterFilterProps = {
  categories: CategoryWithCount[];
};

type RosterParamUpdates = {
  q?: string | null;
  c?: string[];
};

function searchParamsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  const keys = new Set<string>();

  a.forEach((_, key) => keys.add(key));
  b.forEach((_, key) => keys.add(key));

  for (const key of keys) {
    if (a.getAll(key).join("\0") !== b.getAll(key).join("\0")) {
      return false;
    }
  }

  return true;
}

function buildSearchParams(
  current: URLSearchParams,
  updates: RosterParamUpdates,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());

  if ("q" in updates) {
    next.delete(Q_PARAM);

    if (updates.q) {
      next.set(Q_PARAM, updates.q);
    }
  }

  if ("c" in updates) {
    next.delete(C_PARAM);

    for (const categoryId of updates.c ?? []) {
      next.append(C_PARAM, categoryId);
    }
  }

  return next;
}

function getHref(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function RosterFilter({ categories }: RosterFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const qParams = searchParams.getAll(Q_PARAM);
  const urlQ = normalizeRosterQ(
    qParams.length === 0
      ? undefined
      : qParams.length === 1
        ? qParams[0]
        : qParams,
  );
  const selectedCategoryIds = normalizeRosterCategories(
    searchParams.getAll(C_PARAM),
  );

  const [searchValue, setSearchValue] = useState(urlQ ?? "");
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);

  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setSearchValue(urlQ ?? "");
  }

  const navigate = useCallback(
    (nextParams: URLSearchParams) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      if (searchParamsEqual(currentParams, nextParams)) {
        return;
      }

      router.replace(getHref(pathname, nextParams), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const currentUrlQ = urlQ ?? "";

    if (searchValue === currentUrlQ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      const nextParams = buildSearchParams(
        new URLSearchParams(searchParams.toString()),
        { q: trimmed === "" ? null : trimmed },
      );

      navigate(nextParams);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate, searchParams, searchValue, urlQ]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const current = normalizeRosterCategories(searchParams.getAll(C_PARAM));
    const next = checked
      ? current.some((id) => id.toLowerCase() === categoryId.toLowerCase())
        ? current
        : [...current, categoryId]
      : current.filter((id) => id.toLowerCase() !== categoryId.toLowerCase());

    const nextParams = buildSearchParams(
      new URLSearchParams(searchParams.toString()),
      { c: next },
    );

    navigate(nextParams);
  };

  const hasActiveFilters =
    urlQ !== undefined || selectedCategoryIds.length > 0;

  const handleClear = () => {
    setSearchValue("");

    const nextParams = buildSearchParams(
      new URLSearchParams(searchParams.toString()),
      { q: null, c: [] },
    );

    navigate(nextParams);
  };

  return (
    <div className={styles.root}>
      <label className={styles.searchField} htmlFor="roster-search">
        <span className={styles.label}>Search players</span>
        <input
          id="roster-search"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          maxLength={50}
          className={styles.searchInput}
        />
      </label>

      <fieldset className={styles.categories}>
        <legend className={styles.legend}>Categories</legend>
        {categories.map((category) => {
          const checkboxId = `roster-category-${category.id}`;
          const isSelected = selectedCategoryIds.some(
            (id) => id.toLowerCase() === category.id.toLowerCase(),
          );

          return (
            <div key={category.id} className={styles.categoryOption}>
              <label htmlFor={checkboxId} className={styles.categoryLabel}>
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isSelected}
                  onChange={(event) =>
                    handleCategoryChange(category.id, event.target.checked)
                  }
                />
                <span>{category.name}</span>
              </label>
              <span className={styles.categoryCount} aria-hidden="true">
                ({category.player_count})
              </span>
            </div>
          );
        })}
      </fieldset>

      <button
        type="button"
        onClick={handleClear}
        disabled={!hasActiveFilters}
        className={styles.clearButton}
      >
        Clear filters
      </button>
    </div>
  );
}
