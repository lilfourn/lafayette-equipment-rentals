import { Skeleton } from "@/components/ui/skeleton"

interface PageSkeletonProps {
  variant?: "default" | "equipment-detail" | "listing" | "static"
}

export default function PageSkeleton({ variant = "default" }: PageSkeletonProps) {
  if (variant === "equipment-detail") {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Image Gallery and Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery Skeleton */}
              <Skeleton className="h-96 w-full rounded-lg mb-6" />
              
              {/* Details Card Skeleton */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="border border-gray-200 rounded-lg p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-36 border border-gray-200 rounded-lg p-6">
                <Skeleton className="h-7 w-32 mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md mt-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "listing") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section Skeleton */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 py-12">
          <div className="container mx-auto px-4">
            {/* Breadcrumb Skeleton */}
            <Skeleton className="h-4 w-64 mb-4 bg-white/20" />
            {/* Title Skeleton */}
            <Skeleton className="h-10 w-96 mb-4 bg-white/20" />
            {/* Description Skeleton */}
            <Skeleton className="h-6 w-full max-w-3xl bg-white/20" />
          </div>
        </div>
        
        {/* Grid Content Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === "static") {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* Page Title Skeleton */}
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          
          {/* Content Sections */}
          <div className="max-w-4xl mx-auto space-y-8">
            {[1, 2, 3].map((section) => (
              <div key={section} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default skeleton
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}