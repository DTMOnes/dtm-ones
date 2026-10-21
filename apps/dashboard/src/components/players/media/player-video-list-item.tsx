import { DeletePlayerVideo } from "@/components/players/delete-player-video";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export function PlayerVideoListItem({
  url,
  title,
  videoId,
  playerId,
}: {
  url: string;
  title: string | null;
  videoId: string;
  playerId: string;
}) {
  return (
    <Item variant="muted" className="items-center">
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
        <ItemDescription>{title ?? "YouTube video"}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <DeletePlayerVideo videoId={videoId} playerId={playerId} />
      </ItemActions>
    </Item>
  );
}
