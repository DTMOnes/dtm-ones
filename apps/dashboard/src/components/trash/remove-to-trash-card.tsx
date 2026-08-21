"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TrashIcon } from "@phosphor-icons/react";

import { trashClientAction } from "@/actions/trash/trashClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function RemoveToTrashCard({
  clientId,
  kind,
}: {
  clientId: string;
  kind: "player" | "coach";
}) {
  const router = useRouter();
  const kindLabel = kind === "player" ? "Player" : "Coach";
  const listPath = kind === "player" ? "/players" : "/coaches";

  const { executeAsync, isExecuting } = useAction(trashClientAction, {
    onSuccess: () => {
      toast.success(`${kindLabel} moved to the Trash.`);
      router.push(listPath);
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <Card className="ring-destructive/30">
      <CardHeader className="border-destructive/20 bg-destructive/5">
        <CardTitle>Trash</CardTitle>
        <CardDescription>
          Remove this {kindLabel} to the Trash. They leave this list and the
          Roster. Restore keeps Visibility.
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-destructive/20 bg-destructive/5">
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
      </CardFooter>
    </Card>
  );
}
