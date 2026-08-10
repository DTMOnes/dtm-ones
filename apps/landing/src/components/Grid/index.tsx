"use client";

// Next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Motion
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Styles
import styles from "./styles.module.scss";

// Components
import Cards from "../Cards";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";

// Types
import { PublicRosterPlayer } from "@/types/roster";

const easeOut = [0.16, 1, 0.3, 1] as const;

function EmptyState() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const reduce = useReducedMotion();

  const query = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("c");
  const hasFilters = query.length > 0 || Boolean(category);

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
        {hasFilters ? "No matches" : "No players yet"}
      </h2>
      <p className={styles.empty_copy}>
        {hasFilters
          ? "Nothing fits that search or category. Clear filters to see the full roster."
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

export default function Grid({ players }: { players: PublicRosterPlayer[] }) {
  if (players.length === 0) {
    return (
      <main className={styles.empty_shell}>
        <EmptyState />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <AnimatePresence>
        {players.map((player, index) => (
          <Cards key={player.id} player={player} index={index} />
        ))}
      </AnimatePresence>
    </main>
  );
}
