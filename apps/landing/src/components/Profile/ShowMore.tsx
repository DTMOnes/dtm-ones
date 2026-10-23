"use client";

import { useState, type ReactNode } from "react";

import styles from "./styles.module.scss";

/** A list that shows `initial` items, and `step` more per "See more" until all are shown. */
export default function ShowMore({
  items,
  list: List = "ul",
  className,
  initial = 8,
  step = 4,
}: {
  /** The list's <li> elements, already keyed. */
  items: ReactNode[];
  list?: "ul" | "ol";
  className?: string;
  initial?: number;
  step?: number;
}) {
  const [visible, setVisible] = useState(initial);

  return (
    <>
      <List className={className}>{items.slice(0, visible)}</List>
      {visible < items.length ? (
        <button
          type="button"
          className={`btn btn-ghost ${styles.seeMore}`}
          onClick={() => setVisible((count) => count + step)}
        >
          See more
        </button>
      ) : null}
    </>
  );
}
