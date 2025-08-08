"use client"

import { useFilteredMachines } from "@/hooks/use-filtered-machines"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { type Machine } from "@/components/machine-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import BookingModal from "@/components/booking-modal"
import { useRouter } from "next/navigation"
import NoResults from '@/components/no-results'
import { cn } from "@/lib/utils"
import { getMachineDetailUrlWithoutLocale } from "@/lib/machine-url-helper"

interface EquipmentGridItemProps {
    machine: Machine
    categoryClass?: string
}

function EquipmentGridItem({ machine, categoryClass }: EquipmentGridItemProps) {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const router = useRouter()
    const baseUrl = "https://kimberrubblstg.blob.core.windows.net"
    let imageSourceArray: string[] | undefined = machine.thumbnails
    if (!imageSourceArray || imageSourceArray.length === 0) {
        imageSourceArray = machine.images
    }

    const imageUrls = (imageSourceArray
        ?.map((pathFragment) => {
            if (pathFragment && typeof pathFragment === "string") {
                if (pathFragment.startsWith("http://") || pathFragment.startsWith("https://")) return pathFragment
                const correctedPathFragment = pathFragment.startsWith("/") ? pathFragment : `/${pathFragment}`
                return `${baseUrl}${correctedPathFragment}`
            }
            return null
        })
        .filter(Boolean) as string[]) || []

    if (imageUrls.length === 0) {
        imageUrls.push(`/placeholder.svg?width=300&height=200&query=${encodeURIComponent(machine.primaryType || "equipment")}`)
    }

    const name = `${machine.make || ""} ${machine.model || ""}`.trim() || machine.displayName || "Unnamed Machine"

    // Get rental rates
    const getRentalRates = () => {
        let daily: number | undefined, weekly: number | undefined, monthly: number | undefined;

        if (typeof machine.rentalRate === 'number') {
            monthly = machine.rentalRate;
        } else if (machine.rentalRate && typeof machine.rentalRate === 'object') {
            daily = machine.rentalRate.daily;
            weekly = machine.rentalRate.weekly;
            monthly = machine.rentalRate.monthly;
        }

        if (machine.rateSchedules) {
            machine.rateSchedules.forEach(schedule => {
                if (schedule.label === 'DAY' && schedule.numDays === 1) {
                    daily = schedule.cost;
                } else if (schedule.label === 'WEEK' && schedule.numDays === 7) {
                    weekly = schedule.cost;
                } else if (schedule.label.includes('MOS') || schedule.numDays >= 28) {
                    if (!monthly || schedule.numDays <= 31) {
                        monthly = schedule.cost;
                    }
                }
            });
        }

        // Filter out invalid rates (negative numbers, zero, etc.)
        daily = (daily && daily > 0) ? daily : undefined;
        weekly = (weekly && weekly > 0) ? weekly : undefined;
        monthly = (monthly && monthly > 0) ? monthly : undefined;

        return { daily, weekly, monthly };
    }

    const { daily, weekly, monthly } = getRentalRates();

    // Check if machine should be marked as buy-it-now only
    // If no valid rental rates exist but buy-it-now is available, treat as buy-it-now only
    const hasValidRentalRates = daily || weekly || monthly;
    const shouldBeBuyItNowOnly = !hasValidRentalRates && machine.buyItNowEnabled && machine.buyItNowPrice && machine.buyItNowPrice > 0;

    // Update machine object to mark as buy-it-now only if needed
    if (shouldBeBuyItNowOnly && !machine.buyItNowOnly) {
        machine.buyItNowOnly = true;
    }

    const handleCardClick = (e: React.MouseEvent) => {
        // Only navigate if the click wasn't on a button or link
        const target = e.target as HTMLElement;
        if (!target.closest('button') && !target.closest('a')) {
            router.push(`/equipment-rental/machines/${machine.id}`);
        }
    };

    return (
        <>
            <div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                onClick={handleCardClick}
            >
                {/* Mobile Layout (stacked) */}
                <div className="block lg:hidden p-4">
                    {/* Mobile Image and Title Row */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex-shrink-0 w-20 h-20">
                            <Image
                                src={imageUrls[0]}
                                alt={name}
                                width={80}
                                height={80}
                                className="w-full h-full object-contain rounded-md bg-gray-50"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            {categoryClass && (
                                <p className="text-xs text-gray-500 mb-1">CAT CLASS: {categoryClass}</p>
                            )}
                            <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors leading-tight">{name}</h3>
                            <p className="text-sm text-gray-600">
                                {machine.primaryType}{machine.year && ` • ${machine.year}`}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {machine.rpoEnabled && !machine.buyItNowOnly && (
                                    <Badge className="text-xs badge-theme-primary">
                                        Rent to Own
                                    </Badge>
                                )}
                                {machine.buyItNowOnly && (
                                    <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                        Not Available For Rent
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Pricing Grid - Only show for rental machines */}
                    {!machine.buyItNowOnly && (
                        <div className="grid grid-cols-3 gap-3 text-center mb-4 bg-gray-50 rounded-lg p-3">
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">1 DAY</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {daily ? `$${daily}` : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">1 WEEK</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {weekly ? `$${weekly}` : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">1 MONTH</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {monthly ? `$${monthly}` : '-'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Mobile Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        {!machine.buyItNowOnly && (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsBookingModalOpen(true);
                                }}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-lg font-semibold text-sm"
                            >
                                Book Now
                            </Button>
                        )}
                        <Link
                            href={getMachineDetailUrlWithoutLocale(machine)}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-lg font-semibold text-sm inline-block text-center",
                                machine.buyItNowOnly && "col-span-2"
                            )}
                        >
                            {machine.buyItNowOnly ? 'View Details & Buy Now' : 'Learn More'}
                        </Link>
                    </div>
                </div>

                {/* Desktop Layout (original 12-column grid) */}
                <div className="hidden lg:block">
                    <div className="grid grid-cols-12 gap-6 items-start p-6">
                        {/* Image */}
                        <div className="col-span-3">
                            <Image
                                src={imageUrls[0]}
                                alt={name}
                                width={200}
                                height={150}
                                className="w-full h-32 object-contain rounded-md bg-gray-50"
                            />
                        </div>

                        {/* Equipment Details */}
                        <div className="col-span-5">
                            {categoryClass && (
                                <p className="text-xs text-gray-500 mb-1">CAT CLASS: {categoryClass}</p>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{name}</h3>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {machine.rpoEnabled && !machine.buyItNowOnly && (
                                    <Badge className="text-xs badge-theme-primary">
                                        Rent to Own
                                    </Badge>
                                )}
                                {machine.buyItNowOnly && (
                                    <Badge variant="destructive" className="text-xs">
                                        Not Available For Rent
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-2">SPECIFICATIONS</p>
                                <ul className="space-y-1 text-sm">
                                    <li>• Easy to operate and maintain</li>
                                    {machine.primaryType && <li>• {machine.primaryType} type</li>}
                                    {machine.year && <li>• {machine.year} model year</li>}
                                    <li>• Efficient design for maximum air output</li>
                                </ul>
                            </div>
                        </div>

                        {/* Pricing Columns */}
                        <div className="col-span-4">
                            {!machine.buyItNowOnly && (
                                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">1 DAY</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {daily ? `$${daily}` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">1 WEEK</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {weekly ? `$${weekly}` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">1 MONTH</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {monthly ? `$${monthly}` : '-'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className={cn(
                                "flex gap-3 justify-center",
                                machine.buyItNowOnly && "mt-6"
                            )}>
                                {!machine.buyItNowOnly && (
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsBookingModalOpen(true);
                                        }}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        Book Now
                                    </Button>
                                )}
                                <Link
                                    href={getMachineDetailUrlWithoutLocale(machine)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block text-center"
                                >
                                    {machine.buyItNowOnly ? 'View Details & Buy Now' : 'Learn More'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                machine={machine}
            />
        </>
    )
}

interface ClientEquipmentGridProps {
    machines: Machine[] & { categoryClass?: string }[]
    equipmentTitle: string
    categoryClass: string
}

export default function ClientEquipmentGrid({ machines, equipmentTitle, categoryClass }: ClientEquipmentGridProps) {
    const searchParams = useSearchParams()
    const filteredMachines = useFilteredMachines(machines)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const machinesPerPage = 20

    useEffect(() => {
        // Trigger transition when search params change
        setIsTransitioning(true)
        setCurrentPage(1) // Reset to first page when filters change

        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, 200)

        return () => clearTimeout(timer)
    }, [searchParams])

    // Calculate pagination
    const totalPages = Math.ceil(filteredMachines.length / machinesPerPage)
    const startIndex = (currentPage - 1) * machinesPerPage
    const endIndex = startIndex + machinesPerPage
    const currentMachines = filteredMachines.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className={`transition-all duration-200 ease-in-out ${isTransitioning ? 'opacity-60' : 'opacity-100'
            }`}>
            {filteredMachines.length > 0 ? (
                <>
                    {/* Sort and Results Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="order-2 sm:order-1">
                            <Select defaultValue="best-match">
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="best-match">Best Match</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-gray-600 order-1 sm:order-2">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredMachines.length)} of {filteredMachines.length}
                        </div>
                    </div>

                    {/* Equipment Grid */}
                    <div className="space-y-4">
                        {currentMachines.map((machine) => (
                            <EquipmentGridItem
                                key={machine.id}
                                machine={machine}
                                categoryClass={categoryClass}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-8 px-4">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center px-2 sm:px-4"
                                size="sm"
                            >
                                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Previous</span>
                            </Button>

                            {/* Page Numbers */}
                            <div className="flex space-x-1 overflow-x-auto max-w-[60%] sm:max-w-none">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                onClick={() => handlePageChange(page)}
                                                className="w-8 h-8 sm:w-10 sm:h-10 p-0 flex-shrink-0"
                                                size="sm"
                                            >
                                                {page}
                                            </Button>
                                        )
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="px-1 sm:px-2 text-gray-400">...</span>
                                    }
                                    return null
                                })}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center px-2 sm:px-4"
                                size="sm"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4 sm:ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <NoResults />
            )}
        </div>
    )
} 