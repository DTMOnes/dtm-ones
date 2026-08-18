"use client";

import { UserIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <h1 className="text-2xl font-bold">Players</h1>

      <Empty className="min-h-56 flex-1 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserIcon />
          </EmptyMedia>
          <EmptyTitle>Could not load players</EmptyTitle>
          <EmptyDescription>
            Something went wrong while loading players. Try again in a
            moment.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
