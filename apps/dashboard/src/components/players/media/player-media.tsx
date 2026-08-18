import { PlayerGallery } from "@/components/players/media/player-gallery";
import { PlayerPresentationImage } from "@/components/players/media/player-presentation-image";
import { PlayerVideoField } from "@/components/players/media/player-video-field";
import { PlayerVideoListItem } from "@/components/players/media/player-video-list-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { PlayerDetail } from "@/types/player";

import { VideoCameraIcon } from "@phosphor-icons/react/ssr";

export function PlayerMedia({ player }: { player: PlayerDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <PlayerPresentationImage
        playerId={player.id}
        url={player.presentationImageUrl}
      />
      <PlayerGallery playerId={player.id} images={player.gallery} />
      <Card>
        <CardHeader>
          <CardTitle>YouTube videos</CardTitle>
          <CardDescription>
            Videos are optional. Paste a public YouTube URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlayerVideoField playerId={player.id} />
          {player.videos.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <VideoCameraIcon />
                </EmptyMedia>
                <EmptyTitle>No videos yet</EmptyTitle>
                <EmptyDescription>
                  Paste a YouTube URL so visitors can watch highlights on this
                  profile.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2 border border-dashed p-4">
              {player.videos.map((video) => (
                <li key={video.id}>
                  <PlayerVideoListItem
                    url={video.youtubeUrl}
                    videoId={video.id}
                    playerId={player.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
