"use client";

import { useState } from "react";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteClientFromTrashAction } from "@/actions/trash/deleteClientFromTrash";
import { restoreClientAction } from "@/actions/trash/restoreClient";
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
import { Spinner } from "@/components/ui/spinner";

export function TrashClientActions({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { executeAsync: restore, isExecuting: isRestoring } = useAction(
    restoreClientAction,
    {
      onSuccess: () => {
        toast.success("Client restored.");
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const { executeAsync: destroy, isExecuting: isDeleting } = useAction(
    deleteClientFromTrashAction,
    {
      onSuccess: () => {
        toast.success("Client deleted.");
        setConfirmOpen(false);
        router.refresh();
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError.message);
        }
      },
    },
  );

  const pending = isRestoring || isDeleting;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          void restore({ id: clientId });
        }}
      >
        {isRestoring ? <Spinner /> : "Restore"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={pending}
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
            <AlertDialogTitle>Delete this Client?</AlertDialogTitle>
            <AlertDialogDescription>
              This destroys {clientName}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                void destroy({ id: clientId });
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
