"use client";

// Next
import { useRouter } from "next/navigation";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { deletePlayerVideo } from "@/actions/player-media";

// Shadcn
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Phosphor
import { TrashIcon } from "@phosphor-icons/react";

export default function DeletePlayerVideo({ id }: { id: string }) {
  const router = useRouter();

  const { execute, isExecuting } = useAction(deletePlayerVideo, {
    onSuccess: () => {
      router.refresh();
    },
    onError: () => {
      toast.error("There was an error deleting the video");
    },
  });

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={isExecuting}
      aria-label="Delete video"
      onClick={() => execute({ id })}
    >
      {isExecuting ? <Spinner /> : <TrashIcon className="size-4" />}
    </Button>
  );
}
