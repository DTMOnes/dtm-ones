"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { deletePlayerVideoAction } from "@/actions/players/playerVideo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import { TrashIcon } from "@phosphor-icons/react";

export default function DeletePlayerVideo({
  id,
  playerId,
}: {
  id: string;
  playerId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete(): Promise<void> {
    setPending(true);
    try {
      const result = await deletePlayerVideoAction({
        videoId: id,
        playerId,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("[DeletePlayerVideo]", error);
      toast.error("There was an error deleting the video");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={pending}
      aria-label="Delete video"
      onClick={() => {
        void onDelete();
      }}
    >
      {pending ? <Spinner /> : <TrashIcon className="size-4" />}
    </Button>
  );
}
