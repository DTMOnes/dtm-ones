"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { EyeSlashIcon, GlobeSimpleIcon } from "@phosphor-icons/react";

import { setCoachVisibilityAction } from "@/actions/coaches/setCoachVisibility";
import { ProfileSection } from "@/components/clients/editor-layout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Coach } from "@/types/coach";

export function CoachVisibilityCard({
  coach,
  gaps,
  number,
}: {
  coach: Coach;
  gaps: string[];
  /** Section number in the editor. */
  number: number;
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
    <ProfileSection
      id="visibility"
      number={number}
      title={`Visibility · ${isPublic ? "Public" : "Private"}`}
      icon={<GlobeSimpleIcon />}
      description="Public means this Coach is on the Roster. Private means not on the Roster. A Coach may be public only when the profile is complete."
    >
      <div className="flex flex-col gap-3">
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
      </div>
      <div className="mt-5 border-t pt-4">
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
      </div>
    </ProfileSection>
  );
}
