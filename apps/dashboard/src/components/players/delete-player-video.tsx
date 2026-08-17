"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { removePlayerVideoAction } from "@/actions/players/playerVideo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { TrashIcon } from "@phosphor-icons/react";

export function DeletePlayerVideo({
  videoId,
  playerId,
}: {
  videoId: string;
  playerId: string;
}) {
  const router = useRouter();

  const { executeAsync, isExecuting } = useAction(removePlayerVideoAction, {
    onSuccess: () => {
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={isExecuting}
      aria-label="Delete video"
      onClick={() => {
        void executeAsync({ playerId, videoId });
      }}
    >
      {isExecuting ? <Spinner /> : <TrashIcon className="size-4" />}
    </Button>
  );
}
