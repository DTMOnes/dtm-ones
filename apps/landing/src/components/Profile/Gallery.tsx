"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import type { PublicRosterGalleryImage } from "@/types/roster";

import styles from "./styles.module.scss";

/** Photo grid; a click opens the photo full screen in a native <dialog>. */
export default function Gallery({
  images,
  name,
}: {
  images: PublicRosterGalleryImage[];
  name: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : images[open];

  const show = (index: number) => {
    setOpen(index);
    dialogRef.current?.showModal();
  };

  const step = (delta: number) => {
    setOpen((index) =>
      index === null ? null : (index + delta + images.length) % images.length,
    );
  };

  return (
    <>
      <ul className={styles.gallery}>
        {images.map((image, index) => (
          <li key={image.id}>
            <button
              type="button"
              className={styles.galleryItem}
              onClick={() => show(index)}
              aria-label={`Open photo ${index + 1} of ${name}`}
            >
              <Image src={image.url} alt="" fill sizes="(width < 720px) 50vw, 25vw" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={`${name} photos`}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        {images.length > 1 ? (
          <button
            type="button"
            className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
            onClick={() => step(-1)}
            aria-label="Previous photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M15.5 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        ) : null}
        {current ? (
          <Image
            className={styles.lightboxImage}
            src={current.url}
            alt={`${name}, photo ${(open ?? 0) + 1} of ${images.length}`}
            width={1600}
            height={1600}
            sizes="100vw"
          />
        ) : null}
        {images.length > 1 ? (
          <button
            type="button"
            className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
            onClick={() => step(1)}
            aria-label="Next photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M8.5 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
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
