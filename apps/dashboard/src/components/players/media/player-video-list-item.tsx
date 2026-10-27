"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import {
  removePlayerVideoAction,
  updatePlayerVideoAction,
} from "@/actions/players/playerVideo";
import { RowMenu } from "@/components/form/row-menu";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { updatePlayerVideoSchema } from "@/lib/validation/players";

function onServerError({
  error,
}: {
  error: { serverError?: { message: string } };
}) {
  if (error.serverError) {
    toast.error(error.serverError.message);
  }
}

/** A video row in edit mode: the same fields as adding one, prefilled. */
function PlayerVideoEditor({
  playerId,
  videoId,
  url,
  title,
  onDone,
}: {
  playerId: string;
  videoId: string;
  url: string;
  title: string | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const methods = useForm<z.input<typeof updatePlayerVideoSchema>>({
    resolver: zodResolver(updatePlayerVideoSchema),
    defaultValues: { playerId, videoId, youtubeUrl: url, title: title ?? "" },
  });
  const save = useAction(updatePlayerVideoAction, {
    onSuccess: () => {
      onDone();
      router.refresh();
    },
    onError: onServerError,
  });

  return (
    <FormProvider {...methods}>
      <form
        className="border-primary/40 bg-card flex flex-col gap-4 border p-4"
        onSubmit={methods.handleSubmit((values) => save.executeAsync(values))}
        noValidate
      >
        <input type="hidden" {...methods.register("playerId")} />
        <input type="hidden" {...methods.register("videoId")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="youtubeUrl"
            label="YouTube URL"
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={save.isExecuting}
          />
          <TextField
            name="title"
            label="Title (optional)"
            placeholder="Season highlights 2025-26"
            disabled={save.isExecuting}
          />
        </div>
        <div className="flex gap-2">
          <SubmitButton label="Save" isExecuting={save.isExecuting} />
          <Button
            type="button"
            variant="outline"
            disabled={save.isExecuting}
            onClick={onDone}
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export function PlayerVideoListItem({
  url,
  title,
  videoId,
  playerId,
}: {
  url: string;
  title: string | null;
  videoId: string;
  playerId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const remove = useAction(removePlayerVideoAction, {
    onSuccess: () => router.refresh(),
    onError: onServerError,
  });

  if (editing) {
    return (
      <PlayerVideoEditor
        playerId={playerId}
        videoId={videoId}
        url={url}
        title={title}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <Item variant="muted" className="items-center">
      <ItemContent className="min-w-0">
        <ItemTitle>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
          >
            {url}
          </a>
        </ItemTitle>
        <ItemDescription>{title ?? "YouTube video"}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <RowMenu
          label={title ?? "Video"}
          busy={remove.isExecuting}
          onEdit={() => setEditing(true)}
          onDelete={() => remove.execute({ playerId, videoId })}
        />
      </ItemActions>
    </Item>
  );
}
