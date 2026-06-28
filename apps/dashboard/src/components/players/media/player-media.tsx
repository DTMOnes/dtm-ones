"use client";

// React
import { useMemo } from "react";

// Types
import type { ApiPlayer } from "@/lib/api/types";

// Components
import PlayerImageField from "@/components/players/media/player-image-field";
import PlayerVideoListItem from "@/components/players/media/player-video-list-item";
import PlayerImagePreview from "@/components/players/media/player-image-preview";
import PlayerVideoField from "@/components/players/media/player-video-field";
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
  player: ApiPlayer;
}) {
  const videos = useMemo(
    () =>
      player.media
        .filter((m) => m.media_type === "video")
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
    [player.media],
  );

  const images = useMemo(
    () => player.media.filter((m) => m.media_type === "image"),
    [player.media],
  );

  const institutionalPictures = useMemo(
    () =>
      player.media.filter((m) => m.media_type === "institutional_picture"),
    [player.media],
  );

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Institutional Picture</CardTitle>
          <CardDescription>
            Upload the transparent-background player photo used on the landing
            page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlayerImageField
            playerId={player.id}
            mediaType="institutional_picture"
          />
          {institutionalPictures.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageSquareIcon />
                </EmptyMedia>
                <EmptyTitle>No institutional picture yet</EmptyTitle>
                <EmptyDescription>
                  Add the cutout player image that will be used in landing page
                  roster sections.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 border border-dashed">
              {institutionalPictures.map((m) => (
                <li key={m.id}>
                  <PlayerImagePreview
                    url={m.url}
                    alt={`${player.full_name} institutional picture`}
                    className="w-full"
                    mediaId={m.id}
                    playerId={player.id}
                  />
                </li>
              ))}
            </ul>
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
          <PlayerImageField playerId={player.id} />
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
                    playerId={player.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Presentation Videos</CardTitle>
          <CardDescription>
            Add YouTube links as this player&apos;s presentation videos. Paste a
            URL and save to add more.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlayerVideoField playerId={player.id} />
          {videos.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <VideoCameraIcon />
                </EmptyMedia>
                <EmptyTitle>No videos yet</EmptyTitle>
                <EmptyDescription>
                  Paste a YouTube URL so visitors can watch short introductions
                  on this profile.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2 p-4 border border-dashed">
              {videos.map((m) => (
                <li key={m.id}>
                  <PlayerVideoListItem
                    url={m.url}
                    mediaId={m.id}
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
