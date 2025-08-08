"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  MapPinIcon,
  ClockIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
  Calendar,
  ShoppingCart,
  Zap
} from "lucide-react"
import BuyItNowModal from "@/components/buy-it-now-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { getMachineDetailUrlWithoutLocale } from "@/lib/machine-url-helper"

// Updated Machine Interface
export interface Machine {
  id: string
  machineId?: string
  displayName?: string
  make: string
  model: string
  year?: number
  primaryType: string
  usage?: number
  hours?: number
  usageLabel?: string
  usageAbbreviation?: string
  location?: {
    latitude?: number
    longitude?: number
    formattedAddress?: string
    name?: string
    address?: {
      city?: string
      stateProvince?: string
      postalCode?: string
      address1?: string
    }
    point?: {
      type: string
      coordinates: [number, number]
    }
    city?: string
    state?: string
  }
  distanceFromUser?: number
  rentalRate?: number | {
    daily?: number
    weekly?: number
    monthly?: number
  }
  rateSchedules?: Array<{
    label: string
    numDays: number
    cost: number
    discount: number
    discountPercent: number
  }>
  rpoEnabled?: boolean
  buyItNowEnabled?: boolean
  buyItNowPrice?: number
  buyItNowOnly?: boolean // Flag to indicate machines that should only show buy-it-now functionality
  recentCancellations?: number
  relatedAttachments?: Array<{
    name?: string
    displayName?: string
    typeDefinition?: string
    primaryType?: string
    size?: string
    make?: string
    model?: string
    isFixed?: boolean
    position?: string
    standard?: boolean
    url?: string
    uri?: string
    type?: string
    // Rental pricing for attachments
    rentalRate?: number | {
      daily?: number
      weekly?: number
      monthly?: number
    }
    rateSchedules?: Array<{
      label: string
      numDays: number
      cost: number
      discount?: number
      discountPercent: number
    }>
  }>
  images?: string[]
  thumbnails?: string[]

  "@search.score"?: number
  "@search.location"?: {
    distance?: number
  }
}

interface MachineCardProps {
  machine: Machine
}

export default function MachineCard({ machine }: MachineCardProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [isBuyItNowModalOpen, setIsBuyItNowModalOpen] = useState(false)
  const [isReserved, setIsReserved] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([])
  const [showAddedPopup, setShowAddedPopup] = useState(false)
  const t = useTranslations()

  // Check if machine is already reserved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
      const buyItNowRequests = JSON.parse(localStorage.getItem("buyItNowRequests") || "[]")
      const isAlreadyReserved = reservations.some((r: any) => r.machineId === machine.id)
      const isBuyItNowRequested = buyItNowRequests.includes(machine.id)
      setIsReserved(isAlreadyReserved || isBuyItNowRequested)
    }
  }, [machine.id])

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

  const name = `${machine.make || ""} ${machine.model || ""}`.trim() || machine.displayName || "Unnamed Machine"

  // Handle location display with new API structure
  let locationDisplay = ""
  if (machine.location?.address?.city && machine.location?.address?.stateProvince) {
    locationDisplay = `${machine.location.address.city}, ${machine.location.address.stateProvince}`
  } else if (machine.location?.city && machine.location?.state) {
    locationDisplay = `${machine.location.city}, ${machine.location.state}`
  } else if (machine.location?.name) {
    locationDisplay = machine.location.name
  }

  // Helper function to get rental rates from the new structure
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

  const { daily, weekly, monthly } = getRentalRates();

  // Check if machine should be marked as buy-it-now only
  // If no valid rental rates exist but buy-it-now is available, treat as buy-it-now only
  const hasValidRentalRates = daily || weekly || monthly;
  const shouldBeBuyItNowOnly = !hasValidRentalRates && machine.buyItNowEnabled && machine.buyItNowPrice && machine.buyItNowPrice > 0;

  // Update machine object to mark as buy-it-now only if needed
  if (shouldBeBuyItNowOnly && !machine.buyItNowOnly) {
    machine.buyItNowOnly = true;
  }

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

  const detailPageUrl = getMachineDetailUrlWithoutLocale(machine)

  const handleBookNow = () => {
    if (!machine.relatedAttachments || machine.relatedAttachments.length === 0) {
      // Add to cart directly and show popup
      const cartItem = {
        machineId: machine.id,
        machineName: `${machine.make} ${machine.model}`.trim(),
        machine: machine,
        selectedAttachments: [],
        quantity: 1
      }
      if (typeof window !== "undefined") {
        try {
          const existingCart = JSON.parse(localStorage.getItem("cart") || "[]")

          // Check if item already exists (same machine, no attachments)
          const existingItemIndex = existingCart.findIndex((item: any) =>
            item && item.machineId === machine.id &&
            (!item.selectedAttachments || item.selectedAttachments.length === 0)
          )

          if (existingItemIndex !== -1) {
            // Update quantity of existing item
            existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1
          } else {
            // Add as new item
            existingCart.push(cartItem)
          }

          localStorage.setItem("cart", JSON.stringify(existingCart))
          window.dispatchEvent(new CustomEvent('cartUpdated'))
          setShowAddedPopup(true)
        } catch (error) {
          alert('Error adding machine to cart. Please try again.')
        }
      }
    } else {
      // Open attachment modal as before
      setIsAttachmentModalOpen(true)
    }
  }

  const handleAddToCart = () => {
    // Add machine to cart with selected attachments and quantity
    const cartItem = {
      machineId: machine.id,
      machineName: `${machine.make} ${machine.model}`.trim(),
      machine: machine,
      selectedAttachments: selectedAttachments,
      quantity: 1
    }

    if (typeof window !== "undefined") {
      try {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]")

        // Check if item with same machine and attachments already exists
        const existingItemIndex = existingCart.findIndex((item: any) =>
          item && item.machineId === machine.id &&
          JSON.stringify(item.selectedAttachments || []) === JSON.stringify(selectedAttachments)
        )

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1
        } else {
          // Add as new item
          existingCart.push(cartItem)
        }

        localStorage.setItem("cart", JSON.stringify(existingCart))

        // Dispatch custom event to update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'))

        // Close modal and show success
        setIsAttachmentModalOpen(false)
        setSelectedAttachments([])

        // Show success message
        alert(`Machine added to cart! You can continue shopping or proceed to checkout.`)
      } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Error adding machine to cart. Please try again.')
      }
    }
  }


  const handleContinueShopping = () => {
    setIsAttachmentModalOpen(false)
    setSelectedAttachments([])
  }

  return (
    <>
      <div className="group bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gray-50">
          <Image
            src={validImageUrls[currentImageIndex] || "/placeholder.svg"}
            alt={`${name} image ${currentImageIndex + 1}`}
            fill
            className="object-contain p-4 sm:p-6"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            onError={() => handleImageError(validImageUrls[currentImageIndex])}
          />

          {/* Image Navigation - Touch Friendly */}
          {validImageUrls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 tap-target"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 tap-target"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </>
          )}

          {/* Available Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 shadow-md">
              {t("common.available")}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5 flex-1 flex flex-col">
          {/* Title and Type */}
          <div>
            <h3 className="font-bold text-gray-900 text-xl leading-relaxed line-clamp-2 mb-2">{name}</h3>
            <p className="text-gray-500 text-base">
              {machine.year && machine.primaryType
                ? `${machine.year} ${machine.primaryType}`
                : machine.year
                  ? machine.year.toString()
                  : machine.primaryType || "Equipment"
              }
            </p>
          </div>

          {/* Location and Hours */}
          <div className="space-y-3 flex-1">
            {locationDisplay && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm truncate">{locationDisplay}</span>
              </div>
            )}
            {((machine.usage !== undefined && machine.usage > 0) || (machine.hours !== undefined && machine.hours > 0)) && (
              <div className="flex items-center gap-2 text-yellow-600">
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{(machine.usage || machine.hours || 0).toLocaleString()} hrs</span>
              </div>
            )}
          </div>


          {/* Action Buttons */}
          <div className="pt-4 mt-auto space-y-2">
            <Link href={detailPageUrl} className="block">
              <Button 
                variant="outline" 
                className="w-full border-2 border-turquoise-600 text-turquoise-600 hover:bg-turquoise-50 font-semibold py-3 text-base"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("common.viewDetails")} & Pricing
              </Button>
            </Link>
            {!machine.buyItNowOnly && (
              <Button 
                variant="default" 
                className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-bold py-3 text-base uppercase tracking-wide shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={handleBookNow}
                disabled={isReserved}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isReserved ? t("common.reserved") : t("common.addToCart")}
              </Button>
            )}
          </div>
        </div>

        {/* Modals */}
        {machine.buyItNowEnabled && (
          <BuyItNowModal
            isOpen={isBuyItNowModalOpen}
            onClose={() => setIsBuyItNowModalOpen(false)}
            machine={machine}
            onSubmitted={() => {
              setIsBuyItNowModalOpen(false)
              setIsReserved(true)
            }}
          />
        )}

        {/* Attachment Selection Modal */}
        <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
          <DialogContent className="max-w-2xl bg-white border border-gray-200 shadow-lg">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">{t("equipment.selectAttachments")} ({t("common.optional")})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-gray-600 text-sm">
                Choose any attachments you'd like to include with your rental. You can also skip this step and add attachments later.
              </p>

              {machine.relatedAttachments && machine.relatedAttachments.length > 0 ? (
                <div className="space-y-3">
                  {machine.relatedAttachments.map((attachment, index) => {
                    const attachmentName = attachment.name || attachment.displayName || `Attachment ${index + 1}`
                    const isSelected = selectedAttachments.includes(attachmentName)

                    // Get attachment pricing
                    let attachmentPrice = "FREE"
                    if (attachment.rentalRate) {
                      if (typeof attachment.rentalRate === 'number') {
                        attachmentPrice = `$${attachment.rentalRate}/day`
                      } else if (attachment.rentalRate.daily) {
                        attachmentPrice = `$${attachment.rentalRate.daily}/day`
                      } else if (attachment.rentalRate.weekly) {
                        attachmentPrice = `$${attachment.rentalRate.weekly}/week`
                      } else if (attachment.rentalRate.monthly) {
                        attachmentPrice = `$${attachment.rentalRate.monthly}/month`
                      }
                    }

                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`attachment-${machine.id}-${index}`}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttachments([...selectedAttachments, attachmentName])
                            } else {
                              setSelectedAttachments(selectedAttachments.filter(name => name !== attachmentName))
                            }
                          }}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                        />
                        <label htmlFor={`attachment-${machine.id}-${index}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-foreground">{attachmentName}</div>
                              {(attachment.make || attachment.model) && (
                                <div className="text-sm text-muted-foreground">
                                  {attachment.make} {attachment.model}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-primary ml-2">
                              {attachmentPrice}
                            </div>
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No attachments available for this machine.</p>
              )}

              {selectedAttachments.length > 0 && (
                <div className="p-3 bg-turquoise-50 border border-turquoise-200 rounded-lg">
                  <div className="text-sm text-turquoise-800">
                    <strong>Selected:</strong> {selectedAttachments.join(", ")}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  {t("equipment.continueShopping")}
                </Button>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-turquoise-500 hover:bg-turquoise-600 text-white"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t("common.addToCart")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Added to Cart Popup */}
      <Dialog open={showAddedPopup} onOpenChange={setShowAddedPopup}>
        <DialogContent className="max-w-md bg-card border border-border shadow-lg text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">{t("equipment.addedToCart")}</DialogTitle>
          </DialogHeader>
          <div className="mb-6 text-gray-700">{t("equipment.itemInCart")}</div>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setShowAddedPopup(false)}>
              {t("equipment.continueShopping")}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { 
              setShowAddedPopup(false); 
              const currentPath = window.location.pathname;
              const localeMatch = currentPath.match(/^\/([a-z]{2})\//);
              const locale = localeMatch ? localeMatch[1] : 'en';
              window.location.href = `/${locale}/equipment-rental/cart/checkout-lafayette-la`; 
            }}>
              {t("equipment.goToCart")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
