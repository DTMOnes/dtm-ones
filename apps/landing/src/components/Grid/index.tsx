"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";

import Cards from "@/components/Cards";
import { loadRosterAction } from "@/actions/roster";
import type { PublicRosterPlayer } from "@/types/roster";

import styles from "./styles.module.scss";

export default function Grid({
  clients,
  hasMore,
  q,
  categoryIds,
  kind,
  onClear,
}: {
  clients: PublicRosterPlayer[];
  hasMore: boolean;
  q: string | undefined;
  categoryIds: string[];
  kind: "coach" | undefined;
  onClear: () => void;
}) {
  const [items, setItems] = useState(clients);
  const [more, setMore] = useState(hasMore);
  const { executeAsync, isExecuting } = useAction(loadRosterAction);
  const hasFilters = Boolean(q) || categoryIds.length > 0 || Boolean(kind);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>
          {hasFilters ? "No clients match your search" : "The roster is empty right now"}
        </p>
        {hasFilters ? (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <ul className={styles.grid}>
        {items.map((client) => (
          <li key={client.id}>
            <Cards player={client} />
          </li>
        ))}
      </ul>
      {more ? (
        <div className={styles.loadMore}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={isExecuting}
            onClick={async () => {
              const result = await executeAsync({
                q,
                categoryIds,
                kind,
                offset: items.length,
              });
              const page = result?.data;
              if (!page) {
                return;
              }
              setItems((current) => [...current, ...page.clients]);
              setMore(page.hasMore);
            }}
          >
            {isExecuting ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
