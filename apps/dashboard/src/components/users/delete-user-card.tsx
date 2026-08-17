"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAction } from "next-safe-action/hooks";
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
  isLastOwner: boolean;
  isSelf: boolean;
};

export function DeleteUserCard({
  userId,
  userEmail,
  userName,
  isLastOwner,
  isSelf,
}: DeleteUserCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isDisabled = isLastOwner || isSelf;

  const { executeAsync, isExecuting } = useAction(deleteUserAction, {
    onSuccess: () => {
      toast.success("User deleted successfully.");
      setIsDeleteDialogOpen(false);
      router.push("/users");
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  function description(): string {
    const parts: string[] = [];

    if (isLastOwner) {
      parts.push(
        "You cannot delete the last Owner. Promote another User or create a new Owner first.",
      );
    }

    if (isSelf) {
      parts.push(
        "You cannot delete yourself. Another Owner must do it.",
      );
    }

    if (parts.length > 0) {
      return parts.join(" ");
    }

    return "Permanently remove this User. This cannot be undone.";
  }

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete user</CardTitle>
        <CardDescription>{description()}</CardDescription>
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
            if (!isExecuting) {
              setIsDeleteDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isDisabled || isExecuting}
            >
              Delete user
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete user</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. The User {userEmail} will be permanently
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isExecuting}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isExecuting}
                onClick={() => executeAsync({ id: userId })}
              >
                {isExecuting ? "Deleting..." : "Confirm deletion"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
