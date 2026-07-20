"use client";

import PlayerImageField from "@/components/players/media/player-image-field";
import PlayerImagePreview from "@/components/players/media/player-image-preview";
import PlayerVideoField from "@/components/players/media/player-video-field";
import PlayerVideoListItem from "@/components/players/media/player-video-list-item";
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

import { ImageSquareIcon, VideoCameraIcon } from "@phosphor-icons/react";

export default function PlayerMedia({
  player,
}: {
  player: PlayerDetail;
}) {
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
          <PlayerImageField playerId={player.id} kind="presentation" />
          {!player.presentation_image_url ? (
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
              <li>
                <PlayerImagePreview
                  url={player.presentation_image_url}
                  alt={`${player.full_name} institutional picture`}
                  className="w-full"
                  playerId={player.id}
                  kind="presentation"
                />
              </li>
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
          <PlayerImageField playerId={player.id} kind="gallery" />
          {player.gallery_images.length === 0 ? (
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
              {player.gallery_images.map((image) => (
                <li key={image.id}>
                  <PlayerImagePreview
                    url={image.url}
                    alt=""
                    className="w-full"
                    playerId={player.id}
                    kind="gallery"
                    imageId={image.id}
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
          {player.videos.length === 0 ? (
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
              {player.videos.map((video) => (
                <li key={video.id}>
                  <PlayerVideoListItem
                    url={video.youtube_url}
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
