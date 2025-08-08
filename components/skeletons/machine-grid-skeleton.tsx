"use client"

import MachineCardSkeleton from "./machine-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

interface MachineGridSkeletonProps {
  showFilters?: boolean
  itemCount?: number
}

export default function MachineGridSkeleton({ 
  showFilters = false, 
  itemCount = 9 
}: MachineGridSkeletonProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section with Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Search Bar Skeleton */}
          <div className="w-full lg:w-96">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          
          {/* Sort and Filter Controls Skeleton */}
          <div className="flex gap-4 items-center">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md lg:hidden" />
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="mt-4">
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar Skeleton (Desktop) */}
        {showFilters && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* Filter Section Skeletons */}
              {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Machine Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: itemCount }, (_, i) => (
              <MachineCardSkeleton key={i} />
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-12 flex justify-center items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex gap-1">
              {[1, 2, 3].map((page) => (
                <Skeleton key={page} className="h-10 w-10 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}