import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Machine } from "@/components/machine-card"
import { validateEmail, validatePhone, handlePhoneInputChange } from "@/lib/validation"
import { HCaptchaComponent } from "@/components/hcaptcha-provider"
import { 
    User, 
    Mail, 
    Phone, 
    Building2, 
    MessageSquare, 
    Package, 
    CheckCircle, 
    DollarSign,
    ShoppingCart,
    X
} from "lucide-react"

interface BuyItNowModalProps {
    isOpen: boolean
    onClose: () => void
    machine: Machine
    onSubmitted?: () => void
}

export default function BuyItNowModal({ isOpen, onClose, machine, onSubmitted }: BuyItNowModalProps) {
    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        comment: "",
    })
    const [selectedAttachments, setSelectedAttachments] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)

    // Helper function to get attachment rental rates
    const getAttachmentRates = (attachment: any) => {
        let daily: number | undefined, weekly: number | undefined, monthly: number | undefined;

        if (typeof attachment.rentalRate === 'number') {
            monthly = attachment.rentalRate;
        } else if (attachment.rentalRate && typeof attachment.rentalRate === 'object') {
            daily = attachment.rentalRate.daily;
            weekly = attachment.rentalRate.weekly;
            monthly = attachment.rentalRate.monthly;
        }

        if (attachment.rateSchedules) {
            attachment.rateSchedules.forEach((schedule: any) => {
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

        // Filter out invalid rates
        daily = (daily && daily > 0) ? daily : undefined;
        weekly = (weekly && weekly > 0) ? weekly : undefined;
        monthly = (monthly && monthly > 0) ? monthly : undefined;

        return { daily, weekly, monthly };
    }

    useEffect(() => {
        if (isOpen) {
            setSubmitted(false)
            setSelectedAttachments([])
            setCaptchaToken(null)
        }
    }, [isOpen])

    // Using validation functions from lib/validation.ts

    const isValid =
        contactInfo.name &&
        validateEmail(contactInfo.email) &&
        validatePhone(contactInfo.phone) &&
        captchaToken !== null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        if (name === 'phone') {
            // Handle phone formatting
            handlePhoneInputChange(value, (formattedPhone) => {
                setContactInfo({ ...contactInfo, phone: formattedPhone })
                setErrors((prev) => ({
                    ...prev,
                    phone: formattedPhone && !validatePhone(formattedPhone) ? "Phone number must be 10 digits" : undefined
                }))
            })
        } else if (name === "email") {
            setContactInfo({ ...contactInfo, email: value })
            setErrors((prev) => ({ ...prev, email: validateEmail(value) ? undefined : "Invalid email address" }))
        } else {
            setContactInfo({ ...contactInfo, [name]: value })
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)

        // Save to localStorage
        if (typeof window !== "undefined") {
            const requests = JSON.parse(localStorage.getItem("buyItNowRequests") || "[]")
            if (!requests.includes(machine.id)) {
                requests.push(machine.id)
                localStorage.setItem("buyItNowRequests", JSON.stringify(requests))
            }
        }

        // Send email notification
        try {
            const emailPayload = {
                type: 'buy-now',
                customerEmail: contactInfo.email,
                customerName: contactInfo.name,
                customerPhone: contactInfo.phone,
                businessName: contactInfo.businessName,
                comment: contactInfo.comment,
                machineId: machine.id,
                machineName: `${machine.make} ${machine.model}`.trim(),
                machineYear: machine.year?.toString(),
                machineMake: machine.make,
                machineModel: machine.model,
                machineType: machine.primaryType,
                buyItNowPrice: machine.buyItNowPrice,
                attachments: machine.relatedAttachments?.filter(att => {
                    const attachmentName = att.name || att.displayName || ''
                    return selectedAttachments.includes(attachmentName)
                }).map(att => {
                    const { daily: attDaily, weekly: attWeekly, monthly: attMonthly } = getAttachmentRates(att)
                    return {
                        name: att.name || att.displayName || '',
                        make: att.make || '',
                        model: att.model || '',
                        pricing: {
                            dailyRate: attDaily,
                            weeklyRate: attWeekly,
                            monthlyRate: attMonthly
                        }
                    }
                }) || []
            }

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailPayload)
            })

            if (!response.ok) {
                console.error('Failed to send email:', response.status)
            } else {
                const data = await response.json()
                console.log('Email sent successfully:', data)
            }
        } catch (error) {
            console.error('Error sending email:', error)
            // Don't block the user flow, just log the error
        }

        setIsLoading(false)
        if (onSubmitted) onSubmitted();
        setSubmitted(true)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw] max-h-[95vh] overflow-hidden flex flex-col bg-white border-0 shadow-2xl p-0">
                <DialogHeader className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 pb-8">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="h-5 w-5 text-turquoise-400" />
                        <DialogTitle className="text-lg font-semibold">Buy It Now Request</DialogTitle>
                    </div>
                    <div className="text-sm text-gray-300 mb-4">
                        <span className="font-semibold text-white">{machine.year} {machine.make} {machine.model}</span>
                        <span className="block text-turquoise-400 mt-1">{machine.primaryType}</span>
                    </div>
                    {machine.buyItNowPrice && (
                        <div className="bg-gradient-to-r from-turquoise-500 to-turquoise-600 rounded-xl p-4 shadow-lg">
                            <div className="text-center">
                                <div className="text-xs text-white/90 font-medium uppercase tracking-wide mb-1">Purchase Price</div>
                                <div className="text-3xl font-bold text-white flex items-center justify-center gap-1">
                                    <DollarSign className="h-6 w-6" />
                                    <span>{machine.buyItNowPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6">
                    {submitted ? (
                        <div className="text-center space-y-6 py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Thank You for Your Request!</h3>
                            <div className="space-y-3">
                                <p className="text-gray-600 text-lg">
                                    Your Buy It Now request for the <span className="font-semibold">{machine.make} {machine.model}</span> has been submitted.
                                </p>
                                <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-4">
                                    <p className="text-turquoise-900 font-medium">
                                        A representative will contact you soon to complete your purchase.
                                    </p>
                                </div>
                            </div>
                            <Button 
                                className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold py-3" 
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <form
                            className="space-y-5"
                            onSubmit={e => {
                                e.preventDefault()
                                if (!captchaToken) {
                                    alert('Please complete the captcha verification')
                                    return
                                }
                                if (isValid) handleSubmit()
                            }}
                        >
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={contactInfo.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500 transition-colors"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={contactInfo.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                    className="border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500 transition-colors"
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1 ml-6">{errors.email}</div>}
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={contactInfo.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="(555) 123-4567"
                                    className="border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500 transition-colors"
                                />
                                {errors.phone && <div className="text-red-500 text-xs mt-1 ml-6">{errors.phone}</div>}
                            </div>

                            {/* Business Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="text-gray-700 font-medium flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    Business Name <span className="text-gray-400 text-xs">(optional)</span>
                                </Label>
                                <Input
                                    id="businessName"
                                    name="businessName"
                                    value={contactInfo.businessName}
                                    onChange={handleChange}
                                    placeholder="ABC Construction Inc."
                                    className="border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500 transition-colors"
                                />
                            </div>

                            {/* Attachments Section */}
                            {machine.relatedAttachments && machine.relatedAttachments.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-500" />
                                        Available Attachments <span className="text-gray-400 text-xs">(optional)</span>
                                    </Label>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="text-sm text-gray-600 mb-3">
                                            Select any attachments you'd like to include with your purchase.
                                        </div>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {machine.relatedAttachments.map((attachment, index) => {
                                                const attachmentName = attachment.name || attachment.displayName || `Attachment ${index + 1}`
                                                const isSelected = selectedAttachments.includes(attachmentName)
                                                const { daily: attDaily, weekly: attWeekly, monthly: attMonthly } = getAttachmentRates(attachment)
                                                const hasPricing = attDaily || attWeekly || attMonthly

                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`
                                                            flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer
                                                            ${isSelected 
                                                                ? 'bg-turquoise-50 border-turquoise-400 shadow-sm' 
                                                                : 'bg-white border-gray-200 hover:border-turquoise-300 hover:bg-turquoise-50/50'
                                                            }
                                                        `}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedAttachments(selectedAttachments.filter(name => name !== attachmentName))
                                                            } else {
                                                                setSelectedAttachments([...selectedAttachments, attachmentName])
                                                            }
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`buy-attachment-${index}`}
                                                            checked={isSelected}
                                                            onChange={() => {}} // Handled by div onClick
                                                            className="mt-1 w-4 h-4 text-turquoise-600 border-gray-300 rounded focus:ring-turquoise-500"
                                                        />
                                                        <label htmlFor={`buy-attachment-${index}`} className="flex-1 cursor-pointer">
                                                            <div className="font-medium text-gray-900">{attachmentName}</div>
                                                            {(attachment.make || attachment.model) && (
                                                                <div className="text-xs text-gray-600 mt-0.5">
                                                                    {attachment.make} {attachment.model}
                                                                </div>
                                                            )}
                                                            {hasPricing && (
                                                                <div className="text-xs text-turquoise-600 mt-1 font-medium">
                                                                    {attDaily && `$${attDaily}/day`}
                                                                    {attDaily && attWeekly && ' • '}
                                                                    {attWeekly && `$${attWeekly}/week`}
                                                                    {(attDaily || attWeekly) && attMonthly && ' • '}
                                                                    {attMonthly && `$${attMonthly}/month`}
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {selectedAttachments.length > 0 && (
                                            <div className="mt-3 p-2 bg-turquoise-100 rounded-lg">
                                                <div className="text-turquoise-800 text-sm">
                                                    <strong>{selectedAttachments.length}</strong> attachment{selectedAttachments.length > 1 ? 's' : ''} selected
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Comment Field */}
                            <div className="space-y-2">
                                <Label htmlFor="comment" className="text-gray-700 font-medium flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    Additional Comments <span className="text-gray-400 text-xs">(optional)</span>
                                </Label>
                                <Textarea
                                    id="comment"
                                    name="comment"
                                    value={contactInfo.comment}
                                    onChange={handleChange}
                                    placeholder="Let us know any specific requirements or questions about your purchase..."
                                    className="border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500 transition-colors min-h-[80px]"
                                />
                            </div>

                            {/* Captcha */}
                            <div className="flex justify-center py-4 bg-gray-50 rounded-lg">
                                <HCaptchaComponent
                                    onVerify={(token) => setCaptchaToken(token)}
                                    onExpire={() => setCaptchaToken(null)}
                                    theme="light"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold py-3 text-base transition-colors shadow-md" 
                                disabled={!isValid || isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Submitting...
                                    </span>
                                ) : (
                                    "Submit Buy It Now Request"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}