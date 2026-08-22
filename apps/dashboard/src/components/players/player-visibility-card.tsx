"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import {
  CheckCircleIcon,
  CircleIcon,
  EyeSlashIcon,
  GlobeSimpleIcon,
} from "@phosphor-icons/react";

import { setPlayerVisibilityAction } from "@/actions/players/setPlayerVisibility";
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
import type { PlayerDetail } from "@/types/player";

function RequirementList({
  heading,
  checks,
  playerId,
  muted = false,
}: {
  heading: string;
  checks: Array<{ label: string; met: boolean }>;
  playerId: string;
  muted?: boolean;
}) {
  if (checks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p
        className={
          muted
            ? "text-muted-foreground text-sm font-medium"
            : "text-sm font-medium"
        }
      >
        {heading}
      </p>
      <ul className="flex flex-col gap-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2 text-sm">
            {check.met ? (
              <CheckCircleIcon
                aria-hidden
                className="text-muted-foreground mt-0.5 size-4 shrink-0"
              />
            ) : (
              <CircleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            )}
            <span className={muted ? "text-muted-foreground" : "font-medium"}>
              {(check.label === "Presentation image" ||
                check.label === "Gallery image" ||
                check.label === "Video") &&
              !check.met ? (
                <Link
                  href={`/players/${playerId}?tab=media`}
                  className="underline underline-offset-2"
                >
                  {check.label}
                </Link>
              ) : (
                check.label
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlayerVisibilityCard({
  player,
  checks,
}: {
  player: PlayerDetail;
  checks: Array<{ label: string; met: boolean }>;
}) {
  const router = useRouter();
  const isPublic = player.visibility === "public";
  const nextVisibility = isPublic ? "private" : "public";
  const gaps = checks.filter((check) => !check.met);

  const { executeAsync, isExecuting } = useAction(setPlayerVisibilityAction, {
    onSuccess: () => {
      toast.success(
        isPublic ? "Player is now private." : "Player is now public.",
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
        <CardTitle className="flex items-baseline gap-2">
          Visibility
          <span className="text-sm font-semibold tracking-tight">
            {isPublic ? "Public" : "Private"}
          </span>
        </CardTitle>
        <CardDescription>
          Does this player show in the landing page? Private means no, public
          means yes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {gaps.length > 0 ? (
          <RequirementList
            heading="Still needed"
            checks={gaps}
            playerId={player.id}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            This profile is complete. It can be public.
          </p>
        )}
        <RequirementList
          heading="Ready"
          checks={checks.filter((check) => check.met)}
          playerId={player.id}
          muted
        />
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          disabled={isExecuting || (!isPublic && gaps.length > 0)}
          onClick={() => {
            void executeAsync({ id: player.id, visibility: nextVisibility });
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
