"use client";

import DeletePlayerVideo from "@/components/players/delete-player-video";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  getYouTubeThumbnailUrl,
  parseYouTubeVideoId,
} from "@/lib/youtube";

export default function PlayerVideoListItem({
  url,
  videoId,
  playerId,
}: {
  url: string;
  videoId: string;
  playerId: string;
}) {
  const parsedVideoId = parseYouTubeVideoId(url);

  return (
    <Item variant="outline" className="items-center">
      {parsedVideoId ? (
        <ItemMedia variant="image">
          <img
            src={getYouTubeThumbnailUrl(parsedVideoId)}
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
        {parsedVideoId ? (
          <ItemDescription>YouTube video</ItemDescription>
        ) : null}
      </ItemContent>
      <ItemActions>
        <DeletePlayerVideo id={videoId} playerId={playerId} />
      </ItemActions>
    </Item>
  );
}
