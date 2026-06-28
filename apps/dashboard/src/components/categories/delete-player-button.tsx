"use client";

// React
import { useState } from "react";

// Next
import { useRouter } from "next/navigation";

// Shadcn
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { useRemovePlayerFromCategoryMutation } from "@/hooks/api/use-categories";

// Phosphor
import { TrashIcon } from "@phosphor-icons/react";

type DeletePlayerButtonProps = {
  categoryId: string;
  player: {
    id: string;
    full_name: string;
  };
};

export default function DeletePlayerButton({
  categoryId,
  player,
}: DeletePlayerButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: removePlayer, isPending } = useRemovePlayerFromCategoryMutation();

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        disabled={isPending}
        onClick={() => setIsDialogOpen(true)}
      >
        <TrashIcon className="size-4" />
      </Button>
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setIsDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from category</AlertDialogTitle>
            <AlertDialogDescription>
              {player.full_name} will no longer belong to this category. The
              player will not be deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                removePlayer(
                  { categoryId, playerId: player.id },
                  {
                    onSuccess: (response) => {
                      toast.success(response.message);
                      setIsDialogOpen(false);
                      router.refresh();
                    },
                    onError: (error) => {
                      toast.error("No se pudo quitar al jugador.", {
                        description:
                          error instanceof ApiError ? error.message : undefined,
                      });
                    },
                  },
                )
              }
            >
              {isPending ? "Removing..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
