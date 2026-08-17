"use client";

import { TagSimpleIcon } from "@phosphor-icons/react";

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
    <main className="flex h-full w-full flex-col gap-10 p-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      <div className="bg-background rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        <Empty className="min-h-56">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagSimpleIcon />
            </EmptyMedia>
            <EmptyTitle>Could not load categories</EmptyTitle>
            <EmptyDescription>
              Something went wrong while loading categories. Try again in a
              moment.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </main>
  );
}
