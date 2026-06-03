"use client";

// Next
import Image from "next/image";

// Utils
import { cn } from "@/lib/utils";
import DeletePlayerImage from "@/components/players/delete-player-image";

export default function PlayerImagePreview({
  url,
  alt = "",
  className,
  width = 320,
  height = 200,
  mediaId,
}: {
  url: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  mediaId?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-muted",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}`, maxWidth: "100%" }}
    >
      {mediaId ? (
        <div className="absolute top-2 right-2 z-10">
          <DeletePlayerImage id={mediaId} />
        </div>
      ) : null}
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        className="object-cover"
      />
    </div>
  );
}
