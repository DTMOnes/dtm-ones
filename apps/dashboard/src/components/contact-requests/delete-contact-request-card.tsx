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
import { useDeleteContactRequestMutation } from "@/hooks/api/use-contact-requests";

type DeleteContactRequestCardProps = {
  requestId: string;
  requestEmail: string;
};

export default function DeleteContactRequestCard({
  requestId,
  requestEmail,
}: DeleteContactRequestCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: confirmDelete, isPending } = useDeleteContactRequestMutation();

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete contact request</CardTitle>
        <CardDescription>
          Permanently remove this contact request from the system. This action
          cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium">{requestEmail}</p>
          <p className="text-muted-foreground text-xs">{requestId}</p>
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
              Delete contact request
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete contact request</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The request from {requestEmail}{" "}
                will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  confirmDelete(requestId, {
                    onSuccess: (response) => {
                      toast.success(response.message);
                      setIsDeleteDialogOpen(false);
                      router.push("/contact-requests");
                    },
                    onError: (error) => {
                      toast.error("Could not delete contact request.", {
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
