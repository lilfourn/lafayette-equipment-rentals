'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange?: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createPageURL = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        return `?${params.toString()}`
    }

    const navigateToPage = (page: number) => {
        if (onPageChange) {
            onPageChange(page)
        } else {
            router.push(createPageURL(page))
        }
    }

    // Generate page numbers to show
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = []
        const showPages = 5 // Show 5 page numbers at most

        if (totalPages <= showPages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show current page and surrounding pages
            let start = Math.max(1, currentPage - 2)
            let end = Math.min(totalPages, currentPage + 2)

            // Adjust if we're near the beginning or end
            if (currentPage <= 3) {
                end = Math.min(totalPages, 5)
            } else if (currentPage >= totalPages - 2) {
                start = Math.max(1, totalPages - 4)
            }

            // Add first page and ellipsis if needed
            if (start > 1) {
                pages.push(1)
                if (start > 2) {
                    pages.push('...')
                }
            }

            // Add page numbers
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            // Add ellipsis and last page if needed
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push('...')
                }
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Previous button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers - Mobile: Show fewer, Desktop: Show more */}
            <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                    <div key={index}>
                        {page === '...' ? (
                            <span className="px-2 sm:px-3 py-2 text-gray-500 text-sm">...</span>
                        ) : (
                            <Button
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => navigateToPage(page as number)}
                                className="min-w-[32px] sm:min-w-[40px] h-8 sm:h-9 text-sm"
                            >
                                {page}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Next button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default Pagination 