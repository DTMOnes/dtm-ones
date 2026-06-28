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
import { ApiError } from "@/lib/api/errors";
import { useDeletePlayerMutation } from "@/hooks/api/use-players";

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
  const { mutate: confirmDelete, isPending } = useDeletePlayerMutation();

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete player</CardTitle>
        <CardDescription>
          Permanently remove this player and all associated media from the
          database. This action cannot be undone.
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
            if (!isPending) {
              setIsDeleteDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isPending}>
              Delete player
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete player</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All data for {fullName} will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  confirmDelete(playerId, {
                    onSuccess: (response) => {
                      toast.success(response.message);
                      setIsDeleteDialogOpen(false);
                      router.push("/players");
                    },
                    onError: (error) => {
                      toast.error("Failed to delete player.", {
                        description:
                          error instanceof ApiError ? error.message : undefined,
                      });
                    },
                  })
                }
              >
                {isPending ? "Deleting..." : "Confirm deletion"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
