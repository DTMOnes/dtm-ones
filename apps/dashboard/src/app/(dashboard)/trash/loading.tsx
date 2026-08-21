import { ListRowSkeleton, PageShell } from "@/components/page/page-frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      <ListRowSkeleton />
    </PageShell>
  );
}
