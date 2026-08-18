"use client";

import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  addPlayerGalleryImageAction,
  removePlayerGalleryImageAction,
} from "@/actions/players/playerImages";
import { uploadPlayerImage } from "@/lib/blob-client";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import type { PlayerGalleryImage } from "@/types/player";
import {
  PLAYER_IMAGE_CONTENT_TYPES,
  isAllowedPlayerImage,
} from "@/utils/player-blob-path";

import { ImagesIcon, TrashIcon } from "@phosphor-icons/react";

export function PlayerGallery({
  playerId,
  images,
}: {
  playerId: string;
  images: PlayerGalleryImage[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { executeAsync: addImage, isExecuting: isAdding } = useAction(
    addPlayerGalleryImageAction,
    {
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const { executeAsync: removeImage, isExecuting: isRemoving } = useAction(
    removePlayerGalleryImageAction,
    {
      onSuccess: () => {
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const busy = uploading || isAdding || isRemoving;

  async function onFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const files = [...fileList];
    setUploading(true);
    let saved = 0;
    const failed: string[] = [];

    try {
      for (const file of files) {
        if (!isAllowedPlayerImage(file)) {
          failed.push(file.name);
          continue;
        }

        try {
          const blob = await uploadPlayerImage(playerId, "gallery", file);
          const result = await addImage({
            playerId,
            url: blob.url,
            pathname: blob.pathname,
          });
          if (result?.data?.ok) {
            saved += 1;
          } else {
            failed.push(file.name);
          }
        } catch {
          failed.push(file.name);
        }
      }

      if (saved > 0) {
        toast.success(
          saved === 1
            ? "Gallery image saved."
            : `${saved} gallery images saved.`,
        );
        router.refresh();
      }
      if (failed.length > 0) {
        toast.error(
          failed.length === 1
            ? `Could not add ${failed[0]}. Use JPEG, PNG, or WebP of 5 MB or less.`
            : `Could not add ${failed.length} images.`,
        );
      }
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
        <CardDescription>
          Optional extra photos. JPEG, PNG, or WebP, 5 MB or less. You can
          select more than one file.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept={PLAYER_IMAGE_CONTENT_TYPES.join(",")}
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            void onFiles(event.target.files);
          }}
        />
        <Button
          type="button"
          className="w-fit"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploading || isAdding ? <Spinner /> : "Add images"}
        </Button>
        {images.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImagesIcon />
              </EmptyMedia>
              <EmptyTitle>No gallery images yet</EmptyTitle>
              <EmptyDescription>
                Add photos for the Roster. Gallery may stay empty.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <li key={image.id} className="relative">
                <Image
                  src={image.url}
                  alt=""
                  width={400}
                  height={400}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  disabled={busy}
                  aria-label="Remove gallery image"
                  onClick={() => {
                    void removeImage({ playerId, imageId: image.id });
                  }}
                >
                  {isRemoving ? <Spinner /> : <TrashIcon className="size-4" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
