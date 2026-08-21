import { ListRowSkeleton, PageShell } from "@/components/page/page-frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-28 shrink-0" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 min-w-0 flex-1 basis-48" />
          <Skeleton className="size-8 shrink-0" />
        </div>
      </div>

      <ListRowSkeleton />
    </PageShell>
  );
}
