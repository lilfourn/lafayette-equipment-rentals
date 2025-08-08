"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { MapPinIcon, ExternalLink, ChevronLeft, ChevronRight, ShoppingCart, Check } from "lucide-react"
import BookingModal from "@/components/booking-modal"
import BuyItNowModal from "@/components/buy-it-now-modal"
import { type Machine } from "@/components/machine-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getMachineDetailUrlWithoutLocale } from "@/lib/machine-url-helper"
import { useTranslations } from "next-intl"

interface SimpleMachineCardProps {
    machine: Machine
}

export default function SimpleMachineCard({ machine }: SimpleMachineCardProps) {
    const t = useTranslations()
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [isBuyItNowModalOpen, setIsBuyItNowModalOpen] = useState(false)
    const [isReserved, setIsReserved] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false)
    const [selectedAttachments, setSelectedAttachments] = useState<string[]>([])
    const [showAddedToCart, setShowAddedToCart] = useState(false)

    // Process images same way as regular MachineCard
    const baseUrl = "https://kimberrubblstg.blob.core.windows.net"
    let imageSourceArray: string[] | undefined = machine.thumbnails

    if (!imageSourceArray || imageSourceArray.length === 0) {
        imageSourceArray = machine.images
    }

    const imageUrls =
        (imageSourceArray
            ?.map((pathFragment) => {
                if (pathFragment && typeof pathFragment === "string") {
                    // Check if pathFragment is already a full URL
                    if (pathFragment.startsWith("http://") || pathFragment.startsWith("https://")) {
                        return pathFragment // Use as-is
                    }
                    // If relative, ensure it starts with a slash and prepend base URL
                    const correctedPathFragment = pathFragment.startsWith("/") ? pathFragment : `/${pathFragment}`
                    const fullUrl = `${baseUrl}${correctedPathFragment}`
                    return fullUrl
                }
                return null
            })
            .filter(Boolean) as string[]) || []

    if (imageUrls.length === 0) {
        const fallbackUrl = `/placeholder.svg?width=400&height=300&query=${encodeURIComponent(
            machine.primaryType || "equipment",
        )}`
        imageUrls.push(fallbackUrl)
    }

    // Filter out failed images
    const validImageUrls = imageUrls.filter(url => !failedImages.has(url))
    if (validImageUrls.length === 0) {
        validImageUrls.push(`/placeholder.svg?width=400&height=300&query=${encodeURIComponent(machine.primaryType || "equipment")}`)
    }

    // Get rental rates (using same logic as regular MachineCard)
    const getRentalRates = () => {
        let daily: number | undefined, weekly: number | undefined, monthly: number | undefined;

        if (typeof machine.rentalRate === 'number') {
            // If rentalRate is a single number, assume it's monthly
            monthly = machine.rentalRate;
        } else if (machine.rentalRate && typeof machine.rentalRate === 'object') {
            daily = machine.rentalRate.daily;
            weekly = machine.rentalRate.weekly;
            monthly = machine.rentalRate.monthly;
        }

        // Try to get rates from rateSchedules if available
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

    const { daily, weekly, monthly } = getRentalRates()

    // Check if machine should be marked as buy-it-now only
    // If no valid rental rates exist but buy-it-now is available, treat as buy-it-now only
    const hasValidRentalRates = daily || weekly || monthly;
    const shouldBeBuyItNowOnly = !hasValidRentalRates && machine.buyItNowEnabled && machine.buyItNowPrice && machine.buyItNowPrice > 0;

    // Create a new machine object instead of mutating the existing one
    const processedMachine = shouldBeBuyItNowOnly && !machine.buyItNowOnly
        ? { ...machine, buyItNowOnly: true }
        : machine;

    const name = `${processedMachine.year || ''} ${processedMachine.make} ${processedMachine.model}`.trim()

    // Check if machine is already reserved
    useEffect(() => {
        if (typeof window !== "undefined") {
            const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
            const buyItNowRequests = JSON.parse(localStorage.getItem("buyItNowRequests") || "[]")
            const isAlreadyReserved = reservations.some((r: any) => r.machineId === processedMachine.id)
            const isBuyItNowRequested = buyItNowRequests.includes(processedMachine.id)
            setIsReserved(isAlreadyReserved || isBuyItNowRequested)
        }
    }, [processedMachine.id])

    const detailPageUrl = getMachineDetailUrlWithoutLocale(processedMachine)

    // Carousel navigation functions
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % validImageUrls.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + validImageUrls.length) % validImageUrls.length)
    }

    const handleImageError = (src: string) => {
        console.error(`Failed to load image: ${src}`)
        setFailedImages(prev => new Set(prev).add(src))
        // If current image fails, move to next available image
        if (src === validImageUrls[currentImageIndex] && validImageUrls.length > 1) {
            nextImage()
        }
    }

    const handleBookingClose = () => {
        setIsBookingModalOpen(false)
        // Recheck reservation status after modal closes
        if (typeof window !== "undefined") {
            const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
            const isAlreadyReserved = reservations.some((r: any) => r.machineId === processedMachine.id)
            setIsReserved(isAlreadyReserved)
        }
    }

    const handleAddToCart = () => {
        // Check if machine has attachments
        if (processedMachine.relatedAttachments && processedMachine.relatedAttachments.length > 0) {
            // Open attachment selection modal
            setIsAttachmentModalOpen(true)
        } else {
            // Add directly to cart
            addItemToCart([])
        }
    }

    const addItemToCart = (attachments: string[]) => {
        const cartItem = {
            machineId: processedMachine.id,
            machineName: name,
            machine: processedMachine,
            selectedAttachments: attachments,
            quantity: 1
        }

        if (typeof window !== "undefined") {
            try {
                const existingCart = JSON.parse(localStorage.getItem("cart") || "[]")

                // Check if item already exists
                const existingItemIndex = existingCart.findIndex((item: any) =>
                    item && item.machineId === processedMachine.id &&
                    JSON.stringify(item.selectedAttachments || []) === JSON.stringify(attachments)
                )

                if (existingItemIndex !== -1) {
                    // Update quantity
                    existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1
                } else {
                    // Add new item
                    existingCart.push(cartItem)
                }

                localStorage.setItem("cart", JSON.stringify(existingCart))
                window.dispatchEvent(new CustomEvent('cartUpdated'))
                
                // Show success message
                setShowAddedToCart(true)
                setTimeout(() => setShowAddedToCart(false), 3000)
            } catch (error) {
                console.error('Error adding to cart:', error)
                alert('Error adding to cart. Please try again.')
            }
        }
    }

    const handleAttachmentConfirm = () => {
        addItemToCart(selectedAttachments)
        setIsAttachmentModalOpen(false)
        setSelectedAttachments([])
    }

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200 h-full group">
                {/* Image Section with Carousel */}
                <div className="relative">
                    <div className="relative h-48 sm:h-56 bg-gray-50">
                        <Image
                            src={validImageUrls[currentImageIndex]}
                            alt={`${name} - ${processedMachine.primaryType} image ${currentImageIndex + 1}`}
                            fill
                            className="object-contain p-2"
                            onError={() => handleImageError(validImageUrls[currentImageIndex])}
                        />

                        {/* Desktop Navigation Arrows - Hidden on mobile */}
                        {validImageUrls.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="hidden sm:block absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-200"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="hidden sm:block absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-200"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {/* Image Counter - Hidden on mobile when nav buttons are below */}
                        {validImageUrls.length > 1 && (
                            <div className="hidden sm:block absolute bottom-2 right-2 bg-white/95 text-gray-600 px-2 py-1 rounded text-xs">
                                {currentImageIndex + 1} / {validImageUrls.length}
                            </div>
                        )}

                        {/* Badges */}
                        {processedMachine.rpoEnabled && !processedMachine.buyItNowOnly && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge className="text-xs bg-white/95 text-turquoise-700 border-0 font-medium px-2 py-1 shadow-sm">
                                    {t("equipment.rentToBuy")}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation Buttons - Below image */}
                    {validImageUrls.length > 1 && (
                        <div className="flex sm:hidden items-center justify-between px-2 py-2 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={prevImage}
                                className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors tap-target"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-gray-600">
                                {currentImageIndex + 1} / {validImageUrls.length}
                            </span>
                            <button
                                onClick={nextImage}
                                className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg shadow-sm border border-gray-200 transition-colors tap-target"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4">
                    {/* Title and Type */}
                    <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 line-clamp-1">
                            {name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">{processedMachine.primaryType}</p>
                    </div>

                    {/* Location and Hours */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center">
                            <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            <span className="truncate">{processedMachine.location?.city || 'Lafayette'}, {processedMachine.location?.state || 'LA'}</span>
                        </div>
                        {processedMachine.hours && (
                            <span className="text-gray-600 font-medium">{processedMachine.hours.toLocaleString()} {t("equipment.hours")}</span>
                        )}
                    </div>

                    {/* Pricing - Only show for rental machines */}
                    {!processedMachine.buyItNowOnly && (
                        <div className="grid grid-cols-3 gap-0 text-center mb-3 border border-gray-200 rounded-lg overflow-hidden">
                            <div className="py-2.5 bg-white">
                                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">{t("common.daily")}</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {daily ? `$${daily}` : '—'}
                                </p>
                            </div>
                            <div className="border-x border-gray-200 py-2.5 bg-white">
                                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">{t("common.weekly")}</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {weekly ? `$${weekly}` : '—'}
                                </p>
                            </div>
                            <div className="py-2.5 bg-white">
                                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">{t("common.monthly")}</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {monthly ? `$${monthly}` : '—'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        {processedMachine.buyItNowOnly ? (
                            // Buy-it-now-only machines: only show Details and Buy It Now
                            <>
                                <Link href={detailPageUrl}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium"
                                    >
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        {t("common.seeDetails")}
                                    </Button>
                                </Link>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white text-xs font-medium"
                                    onClick={() => setIsBuyItNowModalOpen(true)}
                                    disabled={isReserved}
                                >
                                    {isReserved ? t("common.reserved") : `${t("common.buyNow")} ${processedMachine.buyItNowPrice ? `$${processedMachine.buyItNowPrice.toLocaleString()}` : ""}`}
                                </Button>
                            </>
                        ) : (
                            // Regular machines: show both rental and buy-it-now options
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href={detailPageUrl}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                            {t("common.seeDetails")}
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white text-xs disabled:bg-gray-400 font-medium"
                                        onClick={handleAddToCart}
                                        disabled={isReserved}
                                    >
                                        <ShoppingCart className="mr-1 h-3 w-3" />
                                        {isReserved ? t("common.reserved") : t("common.addToCart")}
                                    </Button>
                                </div>

                                {processedMachine.buyItNowEnabled && (
                                    <Button
                                        size="sm"
                                        className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white text-xs font-medium"
                                        onClick={() => setIsBuyItNowModalOpen(true)}
                                        disabled={isReserved}
                                    >
                                        {isReserved ? t("common.reserved") : `${t("common.buyNow")} ${processedMachine.buyItNowPrice ? `$${processedMachine.buyItNowPrice.toLocaleString()}` : ""}`}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleBookingClose}
                machine={processedMachine}
            />

            {processedMachine.buyItNowEnabled && (
                <BuyItNowModal
                    isOpen={isBuyItNowModalOpen}
                    onClose={() => setIsBuyItNowModalOpen(false)}
                    machine={processedMachine}
                    onSubmitted={() => {
                        setIsBuyItNowModalOpen(false)
                        // Update reservation status to show as reserved
                        setIsReserved(true)
                    }}
                />
            )}

            {/* Attachment Selection Modal */}
            <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader className="pb-4 border-b border-gray-200">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Select Attachments (Optional)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-gray-600 text-sm">
                            Choose any attachments you'd like to include with your rental.
                        </p>
                        {processedMachine.relatedAttachments && processedMachine.relatedAttachments.length > 0 ? (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {processedMachine.relatedAttachments.map((attachment, index) => {
                                    const attachmentName = attachment.name || attachment.displayName || `Attachment ${index + 1}`
                                    const isSelected = selectedAttachments.includes(attachmentName)
                                    return (
                                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                id={`simple-attachment-${index}`}
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAttachments([...selectedAttachments, attachmentName])
                                                    } else {
                                                        setSelectedAttachments(selectedAttachments.filter(n => n !== attachmentName))
                                                    }
                                                }}
                                                className="w-4 h-4 text-turquoise-600"
                                            />
                                            <label htmlFor={`simple-attachment-${index}`} className="flex-1 cursor-pointer">
                                                <div className="font-medium">{attachmentName}</div>
                                                {(attachment.make || attachment.model) && (
                                                    <div className="text-sm text-gray-600">
                                                        {attachment.make} {attachment.model}
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : null}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAttachmentModalOpen(false)
                                    setSelectedAttachments([])
                                }}
                                className="flex-1"
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                onClick={handleAttachmentConfirm}
                                className="flex-1 bg-turquoise-600 hover:bg-turquoise-700 text-white"
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {t("common.addToCart")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Success Toast */}
            {showAddedToCart && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up">
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">{t("equipment.addedToCart")}</span>
                </div>
            )}
        </>
    )
} 