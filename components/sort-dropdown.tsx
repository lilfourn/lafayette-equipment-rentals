"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
    { value: "location-closest", label: "Location: closest" },
    { value: "year-newest", label: "Year: newest to oldest" },
    { value: "year-oldest", label: "Year: oldest to newest" },
    { value: "recently-added", label: "Recently added" },
    { value: "rental-rate-low", label: "Rental rate: low to high" },
    { value: "rental-rate-high", label: "Rental rate: high to low" },
    { value: "buy-now-low", label: "Buy it now: low to high" },
    { value: "buy-now-high", label: "Buy it now: high to low" },
]

interface SortDropdownProps {
    className?: string
}

export default function SortDropdown({ className }: SortDropdownProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get("sort") || "location-closest"

    const handleSortChange = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value && value !== "location-closest") {
                params.set("sort", value)
            } else {
                params.delete("sort")
            }
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        },
        [searchParams, router, pathname],
    )

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Sort by</span>
            <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
} 