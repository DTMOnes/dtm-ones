"use client";

// Next
import { useRouter } from "next/navigation";

// Shadcn
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { useDeletePlayerMediaMutation } from "@/hooks/api/use-player-media";

// Phosphor
import { TrashIcon } from "@phosphor-icons/react";

export default function DeletePlayerImage({
  id,
  playerId,
}: {
  id: string;
  playerId: string;
}) {
  const router = useRouter();
  const { mutate: deleteMedia, isPending } = useDeletePlayerMediaMutation();

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={isPending}
      aria-label="Delete image"
      onClick={() =>
        deleteMedia(
          { mediaId: id, playerId },
          {
            onSuccess: () => {
              router.refresh();
            },
            onError: (error) => {
              toast.error(
                error instanceof ApiError
                  ? error.message
                  : "There was an error deleting the image",
              );
            },
          },
        )
      }
    >
      {isPending ? <Spinner /> : <TrashIcon className="size-4" />}
    </Button>
  );
}
