"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { softDeletePlayerAction } from "@/actions/players/softDeletePlayer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

type DeletePlayerCardProps = {
  playerId: string;
  fullName: string;
};

export default function DeletePlayerCard({
  playerId,
  fullName,
}: DeletePlayerCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmSoftDelete(): Promise<void> {
    setPending(true);
    try {
      const result = await softDeletePlayerAction({ id: playerId });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Player removed from the roster.");
      setIsDeleteDialogOpen(false);
      router.push("/players");
    } catch (error) {
      console.error("[DeletePlayerCard]", error);
      toast.error("Could not remove the player.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Remove player</CardTitle>
        <CardDescription>
          Soft delete hides this player from the roster and public site. Media
          files stay in place. This is not a permanent delete.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium">{fullName}</p>
          <p className="text-muted-foreground text-xs">{playerId}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-destructive/20 bg-destructive/5 py-4">
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            if (!pending) {
              setIsDeleteDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={pending}>
              Remove player
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove player</AlertDialogTitle>
              <AlertDialogDescription>
                {fullName} will be soft deleted and hidden from the roster. You
                can restore them later with a follow up tool. Media files are
                kept.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={() => {
                  void confirmSoftDelete();
                }}
              >
                {pending ? "Removing..." : "Confirm removal"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
