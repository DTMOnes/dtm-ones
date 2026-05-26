"use client";

// Next
import { useRouter } from "next/navigation";

// React
import { useMemo } from "react";

// Actions
import {
  createLandingMedia,
  deleteLandingMedia,
} from "@/actions/landing-media";

// Types
import type { LandingMediaData } from "@/lib/validation/landing-media";

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

const LANDING_NAMESPACE = "landing";

export default function LandingMedia({
  landingMedia,
}: {
  landingMedia: LandingMediaData[];
}) {
  const router = useRouter();

  const videos = useMemo(
    () => landingMedia.filter((m) => m.mediaType === "video"),
    [landingMedia],
  );

  const images = useMemo(
    () => landingMedia.filter((m) => m.mediaType === "image"),
    [landingMedia],
  );

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Hero video</CardTitle>
          <CardDescription>
            Video for the public landing hero (for example MP4). You can keep
            multiple files; the site can pick one as the primary hero asset.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FileField
            action={createLandingMedia}
            namespace={`${LANDING_NAMESPACE}/hero-video`}
            accept="video/*"
            buildPayload={({ uploadedFile, file }) => ({
              id: crypto.randomUUID(),
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
                <EmptyTitle>No hero video yet</EmptyTitle>
                <EmptyDescription>
                  Upload a short clip for the landing hero so visitors see
                  motion above the fold.
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
                    deleteAction={deleteLandingMedia}
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
          <CardTitle>Image gallery</CardTitle>
          <CardDescription>
            Photos for the landing gallery (JPEG, PNG, WebP, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FileField
            action={createLandingMedia}
            namespace={`${LANDING_NAMESPACE}/gallery`}
            accept="image/*"
            buildPayload={({ uploadedFile, file }) => ({
              id: crypto.randomUUID(),
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
                <EmptyTitle>No gallery images yet</EmptyTitle>
                <EmptyDescription>
                  Add images to build out the landing page gallery section.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="grid grid-cols-1 gap-4 border border-dashed p-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((m) => (
                <li key={m.id}>
                  <ImagePreview
                    storagePath={m.storagePath}
                    alt=""
                    className="w-full"
                    deleteAction={deleteLandingMedia}
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
