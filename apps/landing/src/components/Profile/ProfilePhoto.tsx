"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import styles from "./styles.module.scss";

/** The profile photo; a click opens it full screen in the gallery's viewer. */
export default function ProfilePhoto({ src, name }: { src: string; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // The large copy loads only once the viewer opens, like the gallery's.
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.photoButton}
        onClick={() => {
          setOpen(true);
          dialogRef.current?.showModal();
        }}
        aria-label={`Open photo of ${name}`}
      >
        <Image src={src} alt={name} fill sizes="180px" priority />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={`${name} photo`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        {open ? (
          <Image
            className={styles.lightboxImage}
            src={src}
            alt={name}
            width={1600}
            height={1600}
            sizes="100vw"
            loading="eager"
          />
        ) : null}
        <form method="dialog">
          <button type="submit" className={styles.lightboxClose} aria-label="Close photo">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </form>
      </dialog>
    </>
  );
}
