"use client";

// Utils
import { cn } from "@/lib/utils";
import {
  getYouTubeEmbedUrl,
  parseYouTubeVideoId,
} from "@/lib/youtube";
import DeletePlayerVideo from "@/components/media/delete-player-video";

export default function PlayerVideoPreview({
  url,
  mediaId,
  className,
}: {
  url: string;
  mediaId: string;
  className?: string;
}) {
  const videoId = parseYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full max-w-2xl overflow-hidden rounded-md border bg-black",
        className,
      )}
    >
      <div className="absolute top-2 right-2 z-10">
        <DeletePlayerVideo id={mediaId} />
      </div>
      <iframe
        src={getYouTubeEmbedUrl(videoId)}
        title="Player presentation video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    </div>
  );
}
