"use client";

import { useState } from "react";
import Image from "next/image";

import { ExternalIcon, PlayIcon } from "@/components/icons";
import type { PublicRosterVideo } from "@/types/roster";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  parseYouTubeVideoId,
} from "@/utils/youtube";

import styles from "./styles.module.scss";

/** Videos listed at a time; "See more" adds this many more. */
const PAGE_SIZE = 3;

/**
 * Lite embed: our poster and play button until the visitor presses play, then
 * YouTube's own player (its controls cannot be restyled under YouTube's terms).
 */
export default function Highlights({
  videos,
  name,
}: {
  videos: PublicRosterVideo[];
  name: string;
}) {
  const items = videos.flatMap((video, index) => {
    const id = parseYouTubeVideoId(video.youtube_url);
    return id
      ? [{ key: video.id, id, url: video.youtube_url, title: video.title ?? `${name} — highlight ${index + 1}` }]
      : [];
  });
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const current = items[active];
  if (!current) return null;

  return (
    <div className={styles.highlights}>
      <div className={styles.player}>
        {playing ? (
          <iframe
            src={getYouTubeEmbedUrl(current.id, { autoplay: true, mute: false })}
            title={current.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setPlaying(true)}
            aria-label={`Play ${current.title}`}
          >
            <Image src={getYouTubeThumbnailUrl(current.id)} alt="" fill sizes="(width < 1000px) 100vw, 1100px" />
            <span className={styles.playButton} aria-hidden>
              <PlayIcon size={24} />
            </span>
          </button>
        )}
      </div>

      <div className={styles.playerBar}>
        <p className={styles.playerTitle}>{current.title}</p>
        <a href={current.url} target="_blank" rel="noreferrer" className={styles.watchOn}>
          Watch on YouTube
          <ExternalIcon size={12} />
        </a>
      </div>

      {items.length > 1 ? (
        <ul className={styles.rows}>
          {items.slice(0, visible).map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className={styles.row}
                aria-current={index === active ? "true" : undefined}
                onClick={() => {
                  setActive(index);
                  setPlaying(true);
                }}
              >
                <span className={styles.thumb}>
                  <Image src={getYouTubeThumbnailUrl(item.id)} alt="" fill sizes="132px" />
                  <span className={styles.thumbPlay} aria-hidden>
                    <PlayIcon size={14} />
                  </span>
                </span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{item.title}</span>
                  <span className={styles.rowMeta}>
                    {index === active ? "Now showing" : "YouTube"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {items.length > 1 && visible < items.length ? (
        <button
          type="button"
          className={`btn btn-ghost ${styles.seeMore}`}
          onClick={() => setVisible((count) => count + PAGE_SIZE)}
        >
          See more
        </button>
      ) : null}
    </div>
  );
}
