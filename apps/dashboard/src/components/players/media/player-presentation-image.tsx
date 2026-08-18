"use client";

import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  clearPresentationImageAction,
  commitPresentationImageAction,
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
import { Spinner } from "@/components/ui/spinner";
import {
  PLAYER_IMAGE_CONTENT_TYPES,
  isAllowedPlayerImage,
} from "@/utils/player-blob-path";

export function PlayerPresentationImage({
  playerId,
  url,
}: {
  playerId: string;
  url: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { executeAsync: commit, isExecuting: isCommitting } = useAction(
    commitPresentationImageAction,
    {
      onSuccess: () => {
        toast.success("Presentation image saved.");
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const { executeAsync: clear, isExecuting: isClearing } = useAction(
    clearPresentationImageAction,
    {
      onSuccess: () => {
        toast.success("Presentation image removed.");
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const busy = uploading || isCommitting || isClearing;

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!isAllowedPlayerImage(file)) {
      toast.error("Use a JPEG, PNG, or WebP image of 5 MB or less.");
      return;
    }

    setUploading(true);
    try {
      const blob = await uploadPlayerImage(playerId, "presentation", file);
      await commit({
        playerId,
        url: blob.url,
        pathname: blob.pathname,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed.",
      );
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
        <CardTitle>Presentation image</CardTitle>
        <CardDescription>
          A public Player needs a presentation image. JPEG, PNG, or WebP, 5 MB
          or less.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {url ? (
          <Image
            src={url}
            alt="Presentation"
            width={192}
            height={192}
            className="h-48 w-48 rounded-md object-cover"
          />
        ) : (
          <p className="text-muted-foreground text-sm">No presentation image yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={PLAYER_IMAGE_CONTENT_TYPES.join(",")}
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
            }}
          />
          <Button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {uploading || isCommitting ? (
              <Spinner />
            ) : url ? (
              "Replace image"
            ) : (
              "Upload image"
            )}
          </Button>
          {url ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                void clear({ playerId });
              }}
            >
              {isClearing ? <Spinner /> : "Remove"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
