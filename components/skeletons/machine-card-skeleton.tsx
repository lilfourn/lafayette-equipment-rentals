import { Skeleton } from "@/components/ui/skeleton"

export default function MachineCardSkeleton() {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
      {/* Image Section Skeleton */}
      <div className="relative h-64 bg-gray-50">
        <Skeleton className="absolute inset-0 w-full h-full" />
        {/* Available Badge Skeleton */}
        <div className="absolute top-4 right-4">
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-5 flex-1 flex flex-col">
        {/* Title and Type Skeleton */}
        <div>
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        {/* Location and Hours Skeleton */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="pt-4 mt-auto">
          <Skeleton className="w-full h-12 rounded-md" />
        </div>
      </div>
    </div>
  )
}