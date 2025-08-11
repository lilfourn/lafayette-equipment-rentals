"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Info, Phone, Share2, ShoppingCart, Plus, Check } from "lucide-react"
import type { Machine } from "@/components/machine-card"
import BookingModal from "@/components/booking-modal"
import BuyItNowModal from "@/components/buy-it-now-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface MachineDetailBookingProps {
    machine: Machine
    daily?: number
    weekly?: number
    monthly?: number
}

export default function MachineDetailBooking({ machine, daily, weekly, monthly }: MachineDetailBookingProps) {
    const router = useRouter();
    const t = useTranslations();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [isBuyItNowModalOpen, setIsBuyItNowModalOpen] = useState(false)
    const [showBuyItNowSuccess, setShowBuyItNowSuccess] = useState(false)
    const [isReserved, setIsReserved] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false)
    const [selectedAttachments, setSelectedAttachments] = useState<string[]>([])

    // Check if machine is already reserved or has a Buy It Now request
    useEffect(() => {
        if (typeof window !== "undefined") {
            const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
            const isAlreadyReserved = reservations.some((r: any) => r.machineId === machine.id)
            const buyItNowRequests = JSON.parse(localStorage.getItem("buyItNowRequests") || "[]")
            const isBuyItNowRequested = buyItNowRequests.includes(machine.id)
            setIsReserved(isAlreadyReserved || isBuyItNowRequested)

            // Check if mobile
            setIsMobile(window.innerWidth < 768)

            const handleResize = () => {
                setIsMobile(window.innerWidth < 768)
            }

            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [machine.id])

    const handleBookingClose = () => {
        setIsBookingModalOpen(false)
        // Recheck reservation status after modal closes
        if (typeof window !== "undefined") {
            const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
            const isAlreadyReserved = reservations.some((r: any) => r.machineId === machine.id)
            setIsReserved(isAlreadyReserved)
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${machine.make} ${machine.model}`,
                text: `Check out this ${machine.make} ${machine.model} for rent`,
                url: window.location.href
            })
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    const handleContactUs = () => {
        if (isMobile) {
            window.location.href = 'tel:+13375452935'
        } else {
            router.push('/contact')
        }
    }

    const handleBookNow = () => {
        if (machine.relatedAttachments && machine.relatedAttachments.length > 0) {
            setIsAttachmentModalOpen(true)
        } else {
            // No attachments, add directly to cart
            handleAddToCartDirectly()
        }
    }

    const handleAddToCartDirectly = () => {
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

                // Dispatch custom event to update cart count in header
                window.dispatchEvent(new CustomEvent('cartUpdated'))

                // Show success message
                alert('Machine added to cart! You can continue shopping or proceed to checkout.')
            } catch (error) {
                console.error('Error adding to cart:', error)
                alert('Error adding machine to cart. Please try again.')
            }
        }
    }

    const handleAddToCart = () => {
        // Add machine to cart with selected attachments
        const cartItem = {
            machineId: machine.id,
            machineName: `${machine.make} ${machine.model}`.trim(),
            machine: machine,
            selectedAttachments: selectedAttachments
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
                alert('Machine added to cart! You can continue shopping or proceed to checkout.')
            } catch (error) {
                console.error('Error adding to cart:', error)
                alert('Error adding machine to cart. Please try again.')
            }
        }
    }

    const handleContinueShopping = () => {
        setIsAttachmentModalOpen(false)
        setSelectedAttachments([])
        router.push('/')
    }

    const handleProceedToCheckout = () => {
        setIsAttachmentModalOpen(false)
        setSelectedAttachments([])
        // Navigate to cart/checkout page (you'll need to create this)
        router.push('/cart')
    }

    return (
        <>
            {/* Rental Content - Only show for rental machines */}
            <div className="space-y-6">
                {!machine.buyItNowOnly && machine.rpoEnabled && (
                    <Badge className="text-sm p-3 w-full justify-center bg-yellow-100 text-yellow-800 border-yellow-300 font-bold uppercase tracking-wide">
                        <Info className="mr-2 h-4 w-4" /> Rent to Own Available
                    </Badge>
                )}

                {/* Add to Cart Button - Only show for rental machines */}
                {!machine.buyItNowOnly && (
                    <div className="space-y-3">
                        <Button
                            size="lg"
                            className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-black uppercase tracking-wide py-6 text-lg shadow-xl transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400"
                            onClick={handleBookNow}
                            disabled={isReserved}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {isReserved ? t("common.status.machineReserved") : t("common.buttons.addToCart")}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Want to book by phone? Please call us at{" "}
                            <span className="text-blue-600 font-semibold">(337) 545-2935</span>.
                        </div>
                    </div>
                )}

                {/* Buy It Now Section */}
                {machine.buyItNowEnabled && (
                    <Button
                        size="lg"
                        className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-medium py-3"
                        onClick={() => setIsBuyItNowModalOpen(true)}
                        disabled={isReserved}
                    >
                        {isReserved ? "Already Reserved" : `Buy It Now - $${machine.buyItNowPrice?.toLocaleString() || 'N/A'}`}
                    </Button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                        onClick={handleShare}
                    >
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                </div>
            </div>

            {/* Attachment Selection Modal */}
            <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Select Attachments (Optional)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-gray-600 text-sm">
                            Choose any attachments you'd like to include with your rental.
                        </p>

                        {machine.relatedAttachments && machine.relatedAttachments.length > 0 ? (
                            <div className="space-y-3">
                                {machine.relatedAttachments.map((attachment, index) => {
                                    const attachmentName = attachment.name || attachment.displayName || `Attachment ${index + 1}`
                                    const isSelected = selectedAttachments.includes(attachmentName)
                                    
                                    // Get attachment image URL or use placeholder
                                    const attachmentImage = attachment.url || attachment.uri || '/category images/no-machine-image-placeholder.png'

                                    return (
                                        <div 
                                            key={index} 
                                            className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                                                isSelected 
                                                    ? 'border-turquoise-500 bg-turquoise-50' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedAttachments(selectedAttachments.filter(name => name !== attachmentName))
                                                } else {
                                                    setSelectedAttachments([...selectedAttachments, attachmentName])
                                                }
                                            }}
                                        >
                                            {/* Attachment Image */}
                                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                                <img 
                                                    src={attachmentImage} 
                                                    alt={attachmentName}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/category images/no-machine-image-placeholder.png'
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Attachment Details */}
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{attachmentName}</div>
                                                {(attachment.make || attachment.model || attachment.typeDefinition) && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {attachment.typeDefinition || `${attachment.make || ''} ${attachment.model || ''}`.trim()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Selection Indicator */}
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected 
                                                    ? 'bg-turquoise-500 border-turquoise-500' 
                                                    : 'bg-white border-gray-300'
                                            }`}>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-white" />
                                                )}
                                            </div>
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
                                    <strong>Selected ({selectedAttachments.length}):</strong> {selectedAttachments.join(", ")}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                            {machine.buyItNowEnabled && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAttachmentModalOpen(false)
                                        setIsBuyItNowModalOpen(true)
                                    }}
                                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-6 transition-all duration-200"
                                >
                                    Buy It Now
                                </Button>
                            )}
                            <Button
                                onClick={handleAddToCart}
                                className="flex-1 bg-turquoise-500 hover:bg-turquoise-600 text-white font-semibold py-6 transition-all duration-200 flex items-center justify-center"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleBookingClose}
                machine={machine}
            />
            {machine.buyItNowEnabled && (
                <BuyItNowModal
                    isOpen={isBuyItNowModalOpen}
                    onClose={() => setIsBuyItNowModalOpen(false)}
                    machine={machine}
                    onSubmitted={() => {
                        setIsBuyItNowModalOpen(false)
                        setShowBuyItNowSuccess(true)
                    }}
                />
            )}
            <Dialog open={showBuyItNowSuccess} onOpenChange={(open) => {
                setShowBuyItNowSuccess(open)
                if (!open) router.push("/")
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Thank You!</DialogTitle>
                    </DialogHeader>
                    <div className="text-center space-y-4 py-4">
                        <div className="text-green-500 text-5xl">✓</div>
                        <div className="text-lg font-semibold">Thank you for your Buy It Now request, we will get back to you as soon as possible.</div>
                        <Button className="w-full mt-2 bg-turquoise-600 hover:bg-turquoise-700 text-white font-black uppercase tracking-wide" onClick={() => {
                            setShowBuyItNowSuccess(false)
                            router.push("/")
                        }}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 