"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setCoachVisibilityAction } from "@/actions/coaches/setCoachVisibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Coach } from "@/types/coach";

export function CoachVisibilityCard({
  coach,
  gaps,
}: {
  coach: Coach;
  gaps: string[];
}) {
  const router = useRouter();
  const isPublic = coach.visibility === "public";
  const nextVisibility = isPublic ? "private" : "public";

  const { executeAsync, isExecuting } = useAction(setCoachVisibilityAction, {
    onSuccess: () => {
      toast.success(
        isPublic ? "Coach is now private." : "Coach is now public.",
      );
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Visibility</CardTitle>
          <Badge variant={isPublic ? "default" : "secondary"}>
            {isPublic ? "Public" : "Private"}
          </Badge>
        </div>
        <CardDescription>
          Public means this Coach is on the Roster. Private means not on the
          Roster. A Coach may be public only when the profile is complete.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-6">
        {gaps.length > 0 ? (
          <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">Incomplete for the Roster</p>
            <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-4 text-sm">
              {gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            This profile is complete. It can be public.
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end border-t py-4">
        <Button
          type="button"
          disabled={isExecuting || (!isPublic && gaps.length > 0)}
          onClick={() => {
            void executeAsync({ id: coach.id, visibility: nextVisibility });
          }}
        >
          {isExecuting ? (
            <Spinner />
          ) : isPublic ? (
            "Make private"
          ) : (
            "Make public"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
