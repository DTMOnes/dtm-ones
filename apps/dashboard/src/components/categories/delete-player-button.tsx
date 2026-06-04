"use client";

// React
import { useState } from "react";

// Next
import { useRouter } from "next/navigation";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { removePlayerFromCategory } from "@/actions/categories";

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

// Phosphor
import { TrashIcon } from "@phosphor-icons/react";

type DeletePlayerButtonProps = {
  categoryId: string;
  player: {
    id: string;
    fullName: string;
  };
};

export default function DeletePlayerButton({
  categoryId,
  player,
}: DeletePlayerButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { execute, isExecuting } = useAction(removePlayerFromCategory, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "Jugador quitado de la categoría.");
      setIsDialogOpen(false);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error("No se pudo quitar al jugador.", {
        description: error.serverError,
      });
    },
  });

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        disabled={isExecuting}
        onClick={() => setIsDialogOpen(true)}
      >
        <TrashIcon className="size-4" />
      </Button>
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isExecuting) {
            setIsDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from category</AlertDialogTitle>
            <AlertDialogDescription>
              {player.fullName} will no longer belong to this category. The
              player will not be deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isExecuting}
              onClick={() => execute({ categoryId, playerId: player.id })}
            >
              {isExecuting ? "Removing..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
