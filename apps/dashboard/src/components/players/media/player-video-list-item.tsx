"use client";

// Utils
import {
  getYouTubeThumbnailUrl,
  parseYouTubeVideoId,
} from "@/lib/youtube";

// Shadcn
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

// Components
import DeletePlayerVideo from "@/components/players/delete-player-video";

export default function PlayerVideoListItem({
  url,
  mediaId,
}: {
  url: string;
  mediaId: string;
}) {
  const videoId = parseYouTubeVideoId(url);

  return (
    <Item variant="outline" className="items-center">
      {videoId ? (
        <ItemMedia variant="image">
          <img
            src={getYouTubeThumbnailUrl(videoId)}
            alt=""
            className="size-full object-cover"
          />
        </ItemMedia>
      ) : null}
      <ItemContent className="min-w-0">
        <ItemTitle>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
          >
            {url}
          </a>
        </ItemTitle>
        {videoId ? (
          <ItemDescription>YouTube video</ItemDescription>
        ) : null}
      </ItemContent>
      <ItemActions>
        <DeletePlayerVideo id={mediaId} />
      </ItemActions>
    </Item>
  );
}
