"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import styles from "./styles.module.scss";

import Cards from "../Cards";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import { loadRosterAction } from "@/actions/roster";
import type { PublicRosterPlayer } from "@/types/roster";

const easeOut = [0.16, 1, 0.3, 1] as const;

function EmptyState() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const reduce = useReducedMotion();

  const query = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("c");
  const kind = searchParams.get("kind");
  const hasFilters = query.length > 0 || Boolean(category) || Boolean(kind);

  const handleClear = () => {
    startRosterTransition(() => {
      replace(pathname);
    });
  };

  return (
    <motion.div
      className={styles.empty}
      initial={reduce ? false : { opacity: 1, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <h2 className={styles.empty_title}>
        {hasFilters ? "No matches" : "Empty roster"}
      </h2>
      <p className={styles.empty_copy}>
        {hasFilters
          ? "Nothing fits that search or filter. Clear filters to see the full roster."
          : "The public roster is empty right now. Check back soon."}
      </p>
      {hasFilters ? (
        <button type="button" className={styles.empty_action} onClick={handleClear}>
          Clear filters
        </button>
      ) : null}
    </motion.div>
  );
}

export default function Grid({
  clients,
  hasMore,
  q,
  categoryIds,
  kind,
}: {
  clients: PublicRosterPlayer[];
  hasMore: boolean;
  q: string | undefined;
  categoryIds: string[];
  kind: "coach" | undefined;
}) {
  const [items, setItems] = useState(clients);
  const [more, setMore] = useState(hasMore);
  const { executeAsync, isExecuting } = useAction(loadRosterAction);

  if (items.length === 0) {
    return (
      <main className={styles.empty_shell}>
        <EmptyState />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <AnimatePresence>
        {items.map((client, index) => (
          <Cards key={client.id} player={client} index={index} />
        ))}
      </AnimatePresence>
      {more ? (
        <div className={styles.loadMore}>
          <button
            type="button"
            className={styles.loadMoreButton}
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
            Load more
          </button>
        </div>
      ) : null}
    </main>
  );
}
