"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { EyeSlashIcon, GlobeSimpleIcon } from "@phosphor-icons/react";

import { setCoachVisibilityAction } from "@/actions/coaches/setCoachVisibility";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
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
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardAction>
          <span
            className={cn(
              "text-sm font-medium",
              !isPublic && "text-muted-foreground",
            )}
          >
            {isPublic ? "Public" : "Private"}
          </span>
        </CardAction>
        <CardDescription>
          Public means this Coach is on the Roster. Private means not on the
          Roster. A Coach may be public only when the profile is complete.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {gaps.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-medium">Incomplete for the Roster</p>
            <ul className="flex flex-col gap-2">
              {gaps.map((gap) => (
                <li key={gap} className="text-sm">
                  {gap === "Presentation image" || gap === "Gallery image" ? (
                    <Link
                      href={`/clients/${coach.id}?tab=media`}
                      className="underline underline-offset-2"
                    >
                      {gap}
                    </Link>
                  ) : (
                    gap
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            This profile is complete. It can be public.
          </p>
        )}
      </CardContent>
      <CardFooter>
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
            <>
              <EyeSlashIcon />
              Make private
            </>
          ) : (
            <>
              <GlobeSimpleIcon />
              Make public
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
