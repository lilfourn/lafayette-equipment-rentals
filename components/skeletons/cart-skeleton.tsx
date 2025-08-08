import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center space-x-2 mb-6">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            <Skeleton className="h-12 w-96 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-1 w-20" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Skeleton className="w-1 h-8 mr-3" />
                  <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
              
              {/* Cart Items Skeleton */}
              {[1, 2, 3].map((item) => (
                <Card key={item} className="shadow-xl border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Machine Image Skeleton */}
                      <Skeleton className="w-full md:w-48 h-48" />
                      
                      {/* Machine Details Skeleton */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Skeleton className="h-6 w-48 mb-2" />
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-6 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-8" />
                        </div>
                        
                        {/* Attachments Skeleton */}
                        <div className="mb-4">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-28" />
                          </div>
                        </div>
                        
                        {/* Rental Info Preview Skeleton */}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-9 w-32 ml-auto" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Column - Order Summary Skeleton */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 shadow-sm sticky top-24">
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Form Fields Skeleton */}
                  <div className="space-y-6">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-3 w-48 mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}