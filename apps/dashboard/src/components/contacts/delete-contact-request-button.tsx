"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteContactAction } from "@/actions/contacts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const FALLBACK_ERROR_MESSAGE =
  "The contact request could not be validated. Please try again.";

type DeleteContactRequestButtonProps = {
  id: string;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
};

export function DeleteContactRequestButton({
  id,
  disabled = false,
  onPendingChange,
}: DeleteContactRequestButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const remove = useAction(deleteContactAction, {
    onSuccess: ({ data }) => {
      if (!data) return;

      setConfirmOpen(false);
      toast.success("Contact request deleted");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message ?? FALLBACK_ERROR_MESSAGE);
    },
  });

  const isDeleting = remove.isPending;
  const isDisabled = disabled || isDeleting;

  useEffect(() => {
    onPendingChange?.(isDeleting);
  }, [isDeleting, onPendingChange]);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={isDisabled}
        onClick={() => setConfirmOpen(true)}
      >
        Delete
      </Button>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(nextOpen) => {
          if (!isDeleting) {
            setConfirmOpen(nextOpen);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contact request?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the contact request. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                remove.execute({ id });
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
