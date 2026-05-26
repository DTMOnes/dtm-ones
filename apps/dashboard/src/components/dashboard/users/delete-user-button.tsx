"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
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

type DeleteUserButtonProps = {
  userId: string;
  userEmail: string;
};

export default function DeleteUserButton({
  userId,
  userEmail,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { execute, isExecuting } = useAction(deleteUser, {
    onSuccess: ({ data }) => {
      toast.success("User deleted successfully.");
      router.push("/dashboard/users");
      setIsDeleteDialogOpen(false);
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error("There was an error deleting the user.", {
        description: error.serverError,
      });
    },
  });

  return (
    <AlertDialog
      open={isDeleteDialogOpen}
      onOpenChange={(open) => {
        if (!isExecuting) {
          setIsDeleteDialogOpen(open);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={isExecuting}>
          Delete user
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The account of {userEmail} will be
            deleted.
            {userEmail}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isExecuting}
            onClick={() => execute({ id: userId })}
          >
            {isExecuting ? "Deleting..." : "Confirm deletion"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
