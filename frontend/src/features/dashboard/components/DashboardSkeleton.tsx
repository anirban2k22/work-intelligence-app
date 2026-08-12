import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-6 w-36 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
