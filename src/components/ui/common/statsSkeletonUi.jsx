import { Skeleton } from "@/components/ui/skeleton";
function StatsSkeletonUI() {
  return (
    <div className="flex items-center rounded-sm bg-white  p-2">
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default StatsSkeletonUI;
