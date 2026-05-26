"use client";

// Next
import { useRouter } from "next/navigation";

// React
import { useMemo } from "react";

// Actions
import { createPlayerMedia, deletePlayerMedia } from "@/actions/player-media";

// Types
import type { PlayerData } from "@/lib/validation/players";

// Components
import FileField from "@/components/files/file-field";
import ImagePreview from "@/components/files/image-preview";
import VideoPreview from "@/components/files/video-preview";
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

export default function PlayerMedia({ player }: { player: PlayerData }) {
  const router = useRouter();

  const videos = useMemo(
    () => player.playerMedia.filter((m) => m.mediaType === "video"),
    [player.playerMedia],
  );

  const images = useMemo(
    () => player.playerMedia.filter((m) => m.mediaType === "image"),
    [player.playerMedia],
  );

  const namespaceBase = `players/${player.id}`;

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Presentation Video</CardTitle>
          <CardDescription>
            Upload videos (for example MP4). Each file is linked to this player
            profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FileField
            action={createPlayerMedia}
            namespace={`${namespaceBase}/video`}
            accept="video/*"
            buildPayload={({ uploadedFile, file }) => ({
              id: crypto.randomUUID(),
              playerId: player.id,
              mediaType: "video" as const,
              mimeType: file.type || "application/octet-stream",
              storagePath: uploadedFile.path,
            })}
            onPersistSuccess={() => router.refresh()}
          />
          {videos.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <VideoCameraIcon />
                </EmptyMedia>
                <EmptyTitle>No videos yet</EmptyTitle>
                <EmptyDescription>
                  Upload a short presentation clip so this player profile has a
                  quick visual introduction.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-6 border border-dashed">
              {videos.map((m) => (
                <li key={m.id}>
                  <VideoPreview
                    storagePath={m.storagePath}
                    className="sm:max-w-md"
                    deleteAction={deletePlayerMedia}
                    deleteInput={{ id: m.id }}
                    onDeleted={() => router.refresh()}
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
            Upload photos in standard image formats (JPEG, PNG, WebP, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FileField
            action={createPlayerMedia}
            namespace={`${namespaceBase}/gallery`}
            accept="image/*"
            buildPayload={({ uploadedFile, file }) => ({
              id: crypto.randomUUID(),
              playerId: player.id,
              mediaType: "image" as const,
              mimeType: file.type || "application/octet-stream",
              storagePath: uploadedFile.path,
            })}
            onPersistSuccess={() => router.refresh()}
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
                  <ImagePreview
                    storagePath={m.storagePath}
                    alt=""
                    className="w-full"
                    deleteAction={deletePlayerMedia}
                    deleteInput={{ id: m.id }}
                    onDeleted={() => router.refresh()}
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
