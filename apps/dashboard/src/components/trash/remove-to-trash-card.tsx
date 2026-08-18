"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle>Trash</CardTitle>
        <CardDescription>
          Remove this {kindLabel} to the Trash. They leave this list and the
          Roster. Restore keeps Visibility.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isExecuting}
          onClick={() => {
            void executeAsync({ id: clientId });
          }}
        >
          {isExecuting ? <Spinner /> : "Remove to Trash"}
        </Button>
      </CardFooter>
    </Card>
  );
}
