"use client";

// Next
import { useRouter } from "next/navigation";

// React
import { useMemo } from "react";

// Types
import type { PlayerWithRelations } from "@/types/players";

// Components
import PlayerImageField from "@/components/players/player-image-field";
import PlayerImagePreview from "@/components/players/player-image-preview";
import PlayerVideoField from "@/components/players/player-video-field";
import PlayerVideoPreview from "@/components/players/player-video-preview";
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

// Phosphor
import { ImageSquareIcon, VideoCameraIcon } from "@phosphor-icons/react";

export default function PlayerMedia({
  player,
}: {
  player: PlayerWithRelations;
}) {
  const router = useRouter();

  const videos = useMemo(
    () => player.playerMedia.filter((m) => m.mediaType === "video"),
    [player.playerMedia],
  );

  const images = useMemo(
    () => player.playerMedia.filter((m) => m.mediaType === "image"),
    [player.playerMedia],
  );

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Presentation Video</CardTitle>
          <CardDescription>
            Add a YouTube link as this player&apos;s presentation video. One link
            per profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {videos.length === 0 ? (
            <>
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <VideoCameraIcon />
                  </EmptyMedia>
                  <EmptyTitle>No video yet</EmptyTitle>
                  <EmptyDescription>
                    Paste a YouTube URL so visitors can watch a short
                    introduction on this profile.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
              <PlayerVideoField
                playerId={player.id}
                onUploadSuccess={() => router.refresh()}
              />
            </>
          ) : (
            <PlayerVideoPreview
              url={videos[0].url}
              mediaId={videos[0].id}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>
            Upload photos in standard image formats (JPEG, PNG, WebP).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlayerImageField
            playerId={player.id}
            onUploadSuccess={() => router.refresh()}
          />
          {images.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageSquareIcon />
                </EmptyMedia>
                <EmptyTitle>No images yet</EmptyTitle>
                <EmptyDescription>
                  Add a few gallery photos to showcase the player and make this
                  profile more complete.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 border border-dashed">
              {images.map((m) => (
                <li key={m.id}>
                  <PlayerImagePreview
                    url={m.url}
                    alt=""
                    className="w-full"
                    mediaId={m.id}
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
