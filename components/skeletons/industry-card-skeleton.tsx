"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function IndustryCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="h-40 sm:h-56 relative">
        <Skeleton className="absolute inset-0" />
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
