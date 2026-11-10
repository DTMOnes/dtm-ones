"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TrashIcon } from "@phosphor-icons/react";

import { trashClientAction } from "@/actions/trash/trashClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { kindLabel } from "@/utils/clients";

export function RemoveToTrashCard({
  clientId,
  kind,
}: {
  clientId: string;
  kind: "player" | "coach";
}) {
  const router = useRouter();
  const label = kindLabel(kind);

  const { executeAsync, isExecuting } = useAction(trashClientAction, {
    onSuccess: () => {
      toast.success(`${label} moved to the Trash.`);
      router.push("/clients");
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-wrap items-center gap-3 border border-dashed px-4 py-3">
      <TrashIcon aria-hidden className="text-destructive size-5 shrink-0" />
      <p className="text-muted-foreground min-w-0 flex-1 text-sm">
        Remove this {label} to the Trash. They leave this list and the Roster.
        Restore keeps Visibility.
      </p>
      <Button
          type="button"
          variant="destructive"
          disabled={isExecuting}
          onClick={() => {
            void executeAsync({ id: clientId });
          }}
        >
          {isExecuting ? (
            <Spinner />
          ) : (
            <>
              <TrashIcon />
              Move to trash bin
            </>
          )}
      </Button>
    </div>
  );
}
