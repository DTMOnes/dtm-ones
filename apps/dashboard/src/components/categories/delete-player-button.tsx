"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { removePlayerFromCategoryAction } from "@/actions/categories/removePlayerFromCategory";
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
  const [pending, setPending] = useState(false);

  async function onConfirmRemove(): Promise<void> {
    setPending(true);
    try {
      const result = await removePlayerFromCategoryAction({
        categoryId,
        playerId: player.id,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Player removed from category.");
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[DeletePlayerButton]", error);
      toast.error("Could not remove the player.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        disabled={pending}
        onClick={() => setIsDialogOpen(true)}
      >
        <TrashIcon className="size-4" />
      </Button>
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!pending) {
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
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                void onConfirmRemove();
              }}
            >
              {pending ? "Removing..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
