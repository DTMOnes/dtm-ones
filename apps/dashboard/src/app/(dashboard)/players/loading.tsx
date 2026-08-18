import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-40" />

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 min-w-0 flex-1 basis-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 shrink-0" />
            <Skeleton className="h-8 w-28 shrink-0" />
          </div>
        </div>
      </div>

      <div className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
