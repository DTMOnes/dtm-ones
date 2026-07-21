"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { deleteUserAction } from "@/actions/users/deleteUser";
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

type DeleteUserCardProps = {
  userId: string;
  userEmail: string;
  userName: string;
  isOnlyOwner: boolean;
};

export function DeleteUserCard({
  userId,
  userEmail,
  userName,
  isOnlyOwner,
}: DeleteUserCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isDisabled = pending || isOnlyOwner;

  async function onConfirmDelete(): Promise<void> {
    setPending(true);
    try {
      const result = await deleteUserAction({ id: userId });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("User deleted successfully.");
      setIsDeleteDialogOpen(false);
      router.push("/users");
    } catch (error) {
      console.error("[DeleteUserCard]", error);
      toast.error("Could not delete user.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete user</CardTitle>
        <CardDescription>
          {isOnlyOwner
            ? "You cannot delete the only owner. Promote another user or create a new owner before removing this account."
            : "Permanently remove this account from the system. This action cannot be undone."}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-muted-foreground text-xs">{userEmail}</p>
          <p className="text-muted-foreground text-xs">{userId}</p>
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
            <Button type="button" variant="destructive" disabled={isDisabled}>
              Delete user
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete user</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The account for {userEmail} will
                be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={onConfirmDelete}
              >
                {pending ? "Deleting..." : "Confirm deletion"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
