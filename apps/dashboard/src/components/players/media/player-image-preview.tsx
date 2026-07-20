"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { deleteGalleryImageAction } from "@/actions/players/galleryImage";
import { clearPresentationImageAction } from "@/actions/players/presentationImage";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { TrashIcon } from "@phosphor-icons/react";

export default function PlayerImagePreview({
  url,
  alt = "",
  className,
  width = 320,
  height = 200,
  playerId,
  kind,
  imageId,
}: {
  url: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  playerId: string;
  kind: "presentation" | "gallery";
  imageId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete(): Promise<void> {
    setPending(true);
    try {
      const result =
        kind === "presentation"
          ? await clearPresentationImageAction({ playerId })
          : await deleteGalleryImageAction({
              imageId: imageId ?? "",
              playerId,
            });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("[PlayerImagePreview]", error);
      toast.error("There was an error deleting the image");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-muted",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}`, maxWidth: "100%" }}
    >
      <div className="absolute top-2 right-2 z-10">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          disabled={pending || (kind === "gallery" && !imageId)}
          aria-label="Delete image"
          onClick={() => {
            void onDelete();
          }}
        >
          {pending ? <Spinner /> : <TrashIcon className="size-4" />}
        </Button>
      </div>
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        className="object-cover"
      />
    </div>
  );
}
