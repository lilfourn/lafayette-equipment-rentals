"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function IndustryCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header with Title */}
      <div className="px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-5 md:h-6 w-32 bg-gray-200" />
      </div>
      
      {/* Image Area */}
      <div className="h-40 sm:h-56 relative bg-gray-50">
        {/* Main image skeleton */}
        <div className="absolute inset-6 flex items-center justify-center">
          <Skeleton className="h-full w-full bg-gray-100" />
        </div>
        
        {/* Availability badge skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-7 w-24 rounded-full bg-gray-200" />
        </div>
      </div>
      
      {/* Description Area */}
      <div className="p-4">
        <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
      </div>
    </div>
  );
}

export function IndustryBrowseSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <IndustryCardSkeleton key={i} />
      ))}
    </div>
  );
}
