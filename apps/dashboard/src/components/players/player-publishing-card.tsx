"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { updatePlayerStatusAction } from "@/actions/players/updatePlayerStatus";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import type { PlayerDetail, PlayerStatus } from "@/types/player";
import { toast } from "sonner";

function getPublishingGaps(player: PlayerDetail): string[] {
  const gaps: string[] = [];

  if (player.categories.length === 0) {
    gaps.push("At least one category");
  }
  if (!player.presentation_image_url) {
    gaps.push("Presentation image");
  }
  if (player.gallery_images.length === 0) {
    gaps.push("At least one gallery image");
  }
  if (player.videos.length === 0) {
    gaps.push("At least one video");
  }

  return gaps;
}

function PublishingChecklist({ gaps }: { gaps: string[] }) {
  if (gaps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
      <p className="text-sm font-medium">Incomplete for the public profile</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Publishing is still allowed. These items affect what visitors see on
        the landing site.
      </p>
      <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-4 text-sm">
        {gaps.map((gap) => (
          <li key={gap}>{gap}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PlayerPublishingCard({
  player,
}: {
  player: PlayerDetail;
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isPublished = player.status === "published";
  const nextStatus: PlayerStatus = isPublished ? "draft" : "published";
  const gaps = getPublishingGaps(player);
  const actionLabel = isPublished ? "Revert to draft" : "Publish";
  const pendingLabel = isPublished ? "Reverting..." : "Publishing...";

  async function confirmStatusChange(): Promise<void> {
    setPending(true);
    try {
      const result = await updatePlayerStatusAction({
        id: player.id,
        status: nextStatus,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success(
        isPublished
          ? "Player reverted to draft."
          : "Player published successfully.",
      );
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[PlayerPublishingCard]", error);
      toast.error("Could not update publishing status.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-primary/30 ring-primary/15">
      <CardHeader className="border-b border-primary/15">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Publishing</CardTitle>
          <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <CardDescription>
          Published means this player is visible on the public landing site
          (roster and profile pages). Draft keeps them on the dashboard only.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="rounded-md border border-border px-4 py-3">
          <p className="text-sm font-medium">{player.full_name}</p>
          <p className="text-muted-foreground text-xs">
            {isPublished
              ? "Currently live on the public site."
              : "Not visible on the public site yet."}
          </p>
        </div>
        <PublishingChecklist gaps={gaps} />
      </CardContent>
      <CardFooter className="justify-end border-t border-primary/15 bg-primary/5 py-4">
        <AlertDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!pending) {
              setIsDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button type="button" disabled={pending}>
              {actionLabel}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-muted-foreground space-y-3 text-sm">
                  {isPublished ? (
                    <p>
                      {player.full_name} will revert to draft and be removed
                      from the public landing roster and profile pages.
                      Dashboard access is unchanged.
                    </p>
                  ) : (
                    <>
                      <p>
                        {player.full_name} will be published and become visible
                        on the public landing site (roster and profile pages).
                      </p>
                      {gaps.length > 0 ? (
                        <PublishingChecklist gaps={gaps} />
                      ) : null}
                    </>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void confirmStatusChange();
                }}
              >
                {pending ? pendingLabel : `Confirm ${actionLabel.toLowerCase()}`}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
