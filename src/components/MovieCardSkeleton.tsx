
import { Skeleton } from "@/components/ui/skeleton";

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <Skeleton className="w-full h-48 sm:h-64 bg-gray-700" />
      <div className="p-3 sm:p-4">
        <Skeleton className="h-4 sm:h-6 w-3/4 mb-2 bg-gray-700" />
        <Skeleton className="h-3 sm:h-4 w-full mb-1 bg-gray-700" />
        <Skeleton className="h-3 sm:h-4 w-2/3 mb-3 bg-gray-700" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16 bg-gray-700" />
          <Skeleton className="h-4 w-12 bg-gray-700" />
        </div>
      </div>
    </div>
  );
};
