import { CardGridSkeleton } from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-40 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}
