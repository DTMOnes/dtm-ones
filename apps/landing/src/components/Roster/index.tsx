"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import Grid from "@/components/Grid";
import GridLoading from "@/components/Grid/Loading";
import { SearchIcon } from "@/components/icons";
import { COACHES_FILTER_ID } from "@/lib/roster/constants";
import type { PublicRosterPlayer } from "@/types/roster";

import styles from "./styles.module.scss";

type FilterItem = { id: string; name: string };

const ALL_ID = "all";

/** Position chips, name search and the card grid; filters live in the URL. */
export default function Roster({
  filters,
  clients,
  hasMore,
  q,
  categoryIds,
  kind,
}: {
  filters: FilterItem[];
  clients: PublicRosterPlayer[];
  hasMore: boolean;
  q: string | undefined;
  categoryIds: string[];
  kind: "coach" | undefined;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(q ?? "");

  const navigate = (params: URLSearchParams) => {
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearch = useDebouncedCallback((next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }
    navigate(params);
  }, 300);

  const setFilter = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("c");
    params.delete("kind");
    if (id === COACHES_FILTER_ID) {
      params.set("kind", COACHES_FILTER_ID);
    } else if (id !== ALL_ID) {
      params.set("c", id);
    }
    navigate(params);
  };

  const activeId = kind ?? categoryIds[0] ?? ALL_ID;
  const chips = [{ id: ALL_ID, name: "All" }, ...filters];

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.chipsRow}>
          <span className={styles.chipsLabel} id="roster-filter-label">
            Position
          </span>
          <div className={styles.chips} role="radiogroup" aria-labelledby="roster-filter-label">
            {chips.map((chip) => {
              const active = chip.id === activeId;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={active ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                  onClick={() => setFilter(chip.id)}
                >
                  {chip.name}
                </button>
              );
            })}
          </div>
        </div>
        <label className={styles.search}>
          <SearchIcon />
          <input
            type="search"
            aria-label="Search by name"
            placeholder="Search by name"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              handleSearch(event.target.value);
            }}
          />
        </label>
      </div>

      {isPending ? (
        <GridLoading />
      ) : (
        <Grid
          key={`${q ?? ""}:${kind ?? ""}:${categoryIds.join(",")}`}
          clients={clients}
          hasMore={hasMore}
          q={q}
          categoryIds={categoryIds}
          kind={kind}
          onClear={() => {
            setQuery("");
            navigate(new URLSearchParams());
          }}
        />
      )}
    </>
  );
}
