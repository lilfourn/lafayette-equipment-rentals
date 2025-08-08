"use client"

import { type Facets } from "@/components/filter-sidebar"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import FilterSidebar to avoid potential SSR issues
const FilterSidebar = dynamic(() => import("@/components/filter-sidebar"), {
    ssr: false,
    loading: () => (
        <div className="w-full overflow-x-hidden bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="animate-pulse space-y-6">
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                <div className="space-y-3">
                    <div className="h-8 bg-gray-600 rounded"></div>
                    <div className="h-8 bg-gray-600 rounded"></div>
                    <div className="h-8 bg-gray-600 rounded"></div>
                </div>
            </div>
        </div>
    )
})

interface ClientFilterSidebarProps {
    facets: Facets
}

export default function ClientFilterSidebar({ facets }: ClientFilterSidebarProps) {
    return (
        <div>
            <Suspense fallback={
                <div className="w-full overflow-x-hidden bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="animate-pulse space-y-6">
                        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        <div className="space-y-3">
                            <div className="h-8 bg-gray-600 rounded"></div>
                            <div className="h-8 bg-gray-600 rounded"></div>
                            <div className="h-8 bg-gray-600 rounded"></div>
                        </div>
                    </div>
                </div>
            }>
                <FilterSidebar facets={facets} />
            </Suspense>
        </div>
    )
} 