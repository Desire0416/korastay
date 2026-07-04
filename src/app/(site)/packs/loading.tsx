import { CardGridSkeleton } from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-6">
      <Skeleton className="mb-6 h-9 w-52 rounded-full" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
