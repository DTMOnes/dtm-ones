import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex h-full w-full flex-col gap-10 p-10">
      <Skeleton className="h-8 w-40" />

      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-9 shrink-0" />
        <Skeleton className="h-9 w-36 shrink-0" />
      </div>

      <div className="bg-background flex h-full w-full flex-col gap-4 rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
