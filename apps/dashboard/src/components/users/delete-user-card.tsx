"use client";

// React
import { useState } from "react";

// Next
import { useRouter } from "next/navigation";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { deleteUser } from "@/actions/users";

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

type DeleteUserCardProps = {
  userId: string;
  userEmail: string;
  userName: string;
  isOnlyAdmin: boolean;
};

export default function DeleteUserCard({
  userId,
  userEmail,
  userName,
  isOnlyAdmin,
}: DeleteUserCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { execute, isExecuting } = useAction(deleteUser, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "User deleted successfully.");
      setIsDeleteDialogOpen(false);
      router.push("/users");
    },
    onError: ({ error }) => {
      toast.error("Could not delete user.", {
        description: error.serverError,
      });
    },
  });

  const isDisabled = isExecuting || isOnlyAdmin;

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete user</CardTitle>
        <CardDescription>
          {isOnlyAdmin
            ? "You cannot delete the only administrator. Promote another user or create a new administrator before removing this account."
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
            if (!isExecuting) {
              setIsDeleteDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isDisabled}
            >
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
              <AlertDialogCancel disabled={isExecuting}>
                Cancel
              </AlertDialogCancel>
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
      </CardFooter>
    </Card>
  );
}
