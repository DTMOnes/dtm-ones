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
  CardFooter,
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
import {
  PLAYER_IMAGE_CONTENT_TYPES,
  isAllowedPlayerImage,
} from "@/utils/player-blob-path";

import { ArrowsClockwiseIcon, ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";

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

  const actions = (
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
      {url ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => {
            void clear({ playerId });
          }}
        >
          {isClearing ? (
            <Spinner />
          ) : (
            <>
              <TrashIcon />
              Remove
            </>
          )}
        </Button>
      ) : null}
      <Button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {uploading || isCommitting ? (
          <Spinner />
        ) : url ? (
          <>
            <ArrowsClockwiseIcon />
            Replace image
          </>
        ) : (
          <>
            <UploadSimpleIcon />
            Upload image
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presentation image</CardTitle>
        <CardDescription>
          A public Player needs a presentation image. JPEG, PNG, or WebP, 5 MB
          or less.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {url ? (
          <div className="bg-muted/30 w-fit rounded-lg p-2 ring-1 ring-foreground/10">
            <Image
              src={url}
              alt="Presentation"
              width={352}
              height={469}
              className="aspect-[3/4] w-52 rounded-md object-cover"
            />
          </div>
        ) : (
          <Empty className="aspect-[3/4] w-52 min-h-0 flex-none border border-dashed p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageIcon />
              </EmptyMedia>
              <EmptyTitle>No presentation image yet</EmptyTitle>
              <EmptyDescription>
                Upload a photo so this Player can be public on the Roster.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <CardFooter className="gap-2">{actions}</CardFooter>
    </Card>
  );
}
