"use client";

import { useState } from "react";

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

type DeleteContactRequestButtonProps = {
  pending: boolean;
  disabled?: boolean;
  onDelete: () => Promise<boolean>;
};

export function DeleteContactRequestButton({
  pending,
  disabled = false,
  onDelete,
}: DeleteContactRequestButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDisabled = disabled || pending;

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
          if (!pending) {
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
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                void onDelete().then((succeeded) => {
                  if (succeeded) {
                    setConfirmOpen(false);
                  }
                });
              }}
            >
              {pending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
