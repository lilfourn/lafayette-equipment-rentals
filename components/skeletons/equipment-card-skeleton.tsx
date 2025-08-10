import { Skeleton } from "@/components/ui/skeleton";

export function EquipmentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 flex flex-col h-full">
        {/* Equipment Type Badge Skeleton */}
        <div className="mb-3">
          <Skeleton className="h-4 w-24 bg-gray-200" />
        </div>

        {/* Image Skeleton */}
        <Skeleton className="h-48 w-full mb-4 bg-gray-100" />

        {/* Title Skeleton - 2 lines */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-5 w-full bg-gray-200" />
          <Skeleton className="h-5 w-3/4 bg-gray-200" />
        </div>

        {/* Description Skeleton */}
        <Skeleton className="h-4 w-2/3 mb-3 bg-gray-200" />

        {/* Rental Rates Box Skeleton */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          {/* Rental Rates Title */}
          <Skeleton className="h-3 w-20 mx-auto mb-2 bg-gray-200" />
          
          {/* Rate Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-5 w-12 mx-auto mb-1 bg-gray-200" />
                <Skeleton className="h-3 w-14 mx-auto bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-12 w-full bg-gray-200 mt-auto" />
      </div>
    </div>
  );
}

export function PopularEquipmentSectionSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-2 bg-gray-200" />
          <Skeleton className="h-8 w-64 bg-gray-200" />
        </div>

        {/* Equipment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <EquipmentCardSkeleton key={i} />
          ))}
        </div>

        {/* Browse All Link Skeleton */}
        <div className="text-center">
          <Skeleton className="h-6 w-40 mx-auto bg-gray-200" />
        </div>
      </div>
    </section>
  );
}