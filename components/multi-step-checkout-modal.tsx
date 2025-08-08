import { useState, Dispatch, SetStateAction, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import DurationSelector from "@/components/ui/duration-selector"
import { HCaptchaComponent } from "@/components/hcaptcha-provider"

interface Machine {
    id: string
    machineId?: string
    displayName?: string
    make: string
    model: string
    year?: number
    primaryType: string
    rentalRate?: number | { daily?: number; weekly?: number; monthly?: number }
    rateSchedules?: Array<{ label: string; numDays: number; cost: number }>
}
interface CartItem {
    machineId: string
    machineName: string
    machine: Machine
    selectedAttachments: string[]
    quantity?: number
    uniqueId?: string
}
interface RentalData {
    startDate: Date | string
    duration: number
    zipCode: string
    dropOffTime?: string
    pickupTime?: string
}

interface MultiStepCheckoutModalProps {
    isOpen: boolean
    onClose: () => void
    cartItems: CartItem[]
    rentalData: RentalData | null
    setRentalData: Dispatch<SetStateAction<RentalData | null>>
}

export default function MultiStepCheckoutModal({ isOpen, onClose, cartItems, rentalData, setRentalData }: MultiStepCheckoutModalProps) {
    const [step, setStep] = useState(0)
    const [localRentalData, setLocalRentalData] = useState<RentalData>(rentalData || {
        startDate: new Date(),
        duration: 7,
        zipCode: "",
        dropOffTime: "morning",
        pickupTime: "morning"
    })
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        message: "",
        address: ""
    })
    const [formTouched, setFormTouched] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmation, setConfirmation] = useState(false)
    const [error, setError] = useState("")
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return;

        // 1) reset the wizard
        setStep(0);
        setFormTouched(false);
        setConfirmation(false);
        setError("");
        setIsSubmitting(false);
        setCaptchaToken(null);

        // 2) prefill the rental data (or default)
        setLocalRentalData(
            rentalData ?? {
                startDate: new Date(),
                duration: 7,
                zipCode: "",
                dropOffTime: "morning",
                pickupTime: "morning",
            },
        );

        // 3) prefill user info from localStorage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("checkoutUserInfo");
            if (saved) setUserInfo(JSON.parse(saved));
        }
    }, [isOpen, rentalData]);

    // When user info changes, save to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("checkoutUserInfo", JSON.stringify(userInfo))
        }
    }, [userInfo])

    // Pricing helpers (reuse from cart page logic)
    const getRentalRates = (machine: Machine) => {
        let daily: number | undefined, weekly: number | undefined, monthly: number | undefined
        if (typeof machine.rentalRate === 'number') {
            monthly = machine.rentalRate
        } else if (machine.rentalRate && typeof machine.rentalRate === 'object') {
            daily = machine.rentalRate.daily
            weekly = machine.rentalRate.weekly
            monthly = machine.rentalRate.monthly
        }
        if (machine.rateSchedules) {
            machine.rateSchedules.forEach(schedule => {
                if (schedule.label === 'DAY' && schedule.numDays === 1) daily = schedule.cost
                else if (schedule.label === 'WEEK' && schedule.numDays === 7) weekly = schedule.cost
                else if (schedule.label.includes('MOS') || schedule.numDays >= 28) {
                    if (!monthly || schedule.numDays <= 31) monthly = schedule.cost
                }
            })
        }
        daily = (daily && daily > 0) ? daily : undefined
        weekly = (weekly && weekly > 0) ? weekly : undefined
        monthly = (monthly && monthly > 0) ? monthly : undefined
        return { daily, weekly, monthly }
    }
    const calculateItemPrice = (item: CartItem, duration: number) => {
        const { daily, weekly, monthly } = getRentalRates(item.machine)
        const quantity = item.quantity || 1
        if (duration <= 7 && daily) return daily * duration * quantity
        else if (duration <= 30 && weekly) return weekly * Math.ceil(duration / 7) * quantity
        else if (monthly) return monthly * Math.ceil(duration / 30) * quantity
        if (daily) return daily * duration * quantity
        return 0
    }
    const subtotal = localRentalData && localRentalData.duration
        ? cartItems.reduce((total, item) => total + calculateItemPrice(item, localRentalData.duration), 0)
        : 0
    const taxes = subtotal * 0.085
    const total = subtotal + taxes

    // Step 1: Calendar & Duration
    const Step1 = () => {
        const today = new Date()
        const minDate = today.toISOString().split('T')[0]
        const maxDateObj = new Date(today)
        maxDateObj.setDate(today.getDate() + 30)
        const maxDate = maxDateObj.toISOString().split('T')[0]
        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-base font-medium text-gray-900 mb-1">Start Date</label>
                    <Input
                        type="date"
                        value={localRentalData.startDate ? new Date(localRentalData.startDate).toISOString().split('T')[0] : ""}
                        onChange={e => setLocalRentalData({ ...localRentalData, startDate: new Date(e.target.value) })}
                        min={minDate}
                        max={maxDate}
                    />
                    <div className="text-xs text-gray-500 mt-1">Start date must be within 30 days of today's date.</div>
                </div>
                <DurationSelector
                    value={localRentalData.duration}
                    onChange={d => setLocalRentalData({ ...localRentalData, duration: d })}
                    label="Rental Duration"
                />
                <div>
                    <label className="block text-base font-medium text-gray-900 mb-1">Zip Code</label>
                    <Input
                        value={localRentalData.zipCode}
                        onChange={e => {
                            // Only allow numbers, max 5 digits
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 5)
                            setLocalRentalData(prev => ({ ...prev, zipCode: val }))
                        }}
                        placeholder="Enter zip code"
                        maxLength={5}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { setRentalData(localRentalData); setStep(1) }}>Continue</Button>
                </div>
            </div>
        )
    }

    // Step 2: User Info
    const Step2 = () => (
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setFormTouched(true); if (userInfo.name && userInfo.email && userInfo.phone && userInfo.address && captchaToken) setStep(2); else if (!captchaToken) alert('Please complete the captcha verification') }}>
            <Input name="name" value={userInfo.name} onChange={e => setUserInfo(prev => ({ ...prev, name: e.target.value }))} placeholder="Full Name *" required className={formTouched && !userInfo.name ? "border-red-500" : ""} />
            <Input name="email" value={userInfo.email} onChange={e => setUserInfo(prev => ({ ...prev, email: e.target.value }))} placeholder="Email *" required className={formTouched && !userInfo.email ? "border-red-500" : ""} />
            <Input name="phone" value={userInfo.phone} onChange={e => setUserInfo(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone *" required className={formTouched && !userInfo.phone ? "border-red-500" : ""} />
            <Input name="businessName" value={userInfo.businessName} onChange={e => setUserInfo(prev => ({ ...prev, businessName: e.target.value }))} placeholder="Business Name" />
            <Input name="address" value={userInfo.address} onChange={e => setUserInfo(prev => ({ ...prev, address: e.target.value }))} placeholder="Delivery Address *" required className={formTouched && !userInfo.address ? "border-red-500" : ""} />
            <Textarea name="message" value={userInfo.message} onChange={e => setUserInfo(prev => ({ ...prev, message: e.target.value }))} placeholder="Message (optional)" />
            <div className="flex justify-center my-4">
                <HCaptchaComponent
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    theme="light"
                />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" disabled={!captchaToken}>Continue</Button>
            </div>
        </form>
    )

    // Step 3: Summary
    const Step3 = () => (
        <div className="space-y-6">
            <div className="text-lg font-semibold">Order Summary</div>
            <div className="space-y-2">
                {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                        <span>{item.machineName} ({item.quantity || 1}x)</span>
                        <span>${calculateItemPrice(item, localRentalData.duration).toLocaleString()}</span>
                    </div>
                ))}
                <div className="flex justify-between border-t pt-2 mt-2">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Taxes (8.5%):</span>
                    <span>${taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                </div>
                <div className="mt-4">
                    <div><b>Duration:</b> {localRentalData.duration} days</div>
                    <div><b>Start Date:</b> {localRentalData.startDate ? new Date(localRentalData.startDate).toLocaleDateString() : "-"}</div>
                    <div><b>Delivery Address:</b> {userInfo.address}</div>
                </div>
                <div className="mt-4">
                    <div><b>Name:</b> {userInfo.name}</div>
                    <div><b>Email:</b> {userInfo.email}</div>
                    <div><b>Phone:</b> {userInfo.phone}</div>
                    <div><b>Business Name:</b> {userInfo.businessName}</div>
                    {userInfo.message && <div><b>Message:</b> {userInfo.message}</div>}
                </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                No payment takes place until our rental coordinating team gets with you.
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={async () => {
                    setIsSubmitting(true)
                    setError("")
                    try {
                        const payload = {
                            type: 'booking',
                            customerEmail: userInfo.email,
                            customerName: userInfo.name,
                            customerPhone: userInfo.phone,
                            businessName: userInfo.businessName,
                            address: userInfo.address,
                            message: userInfo.message,
                            startDate: localRentalData.startDate,
                            duration: localRentalData.duration,
                            zipCode: localRentalData.zipCode,
                            cartItems: cartItems.map(item => ({
                                machineId: item.machineId,
                                machineName: item.machineName,
                                quantity: item.quantity || 1,
                                year: item.machine.year,
                                primaryType: item.machine.primaryType
                            })),
                            subtotal,
                            taxes,
                            total,
                            captchaToken: captchaToken
                        }
                        const response = await fetch('/api/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        })

                        const result = await response.json()
                        console.log('Email API Response:', result)

                        if (!response.ok) {
                            console.error('Email API Error:', result)
                            throw new Error(`Failed to send email: ${result.error || 'Unknown error'}`)
                        }
                        setConfirmation(true)
                    } catch (e) {
                        setError('There was an error submitting your reservation. Please try again or contact us.')
                    } finally {
                        setIsSubmitting(false)
                    }
                }} disabled={isSubmitting}>
                    {isSubmitting ? 'Reserving...' : 'Reserve Equipment'}
                </Button>
            </div>
        </div>
    )

    // Confirmation
    const Confirmation = () => (
        <div className="space-y-6 text-center">
            <div className="text-2xl font-bold text-green-700">Reservation Submitted!</div>
            <div className="text-gray-700">Thank you for your reservation. Our team will contact you soon to finalize your rental. No payment has been taken yet.</div>
            <Button onClick={onClose}>Close</Button>
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg w-full bg-white border border-gray-200 shadow-lg">
                <DialogHeader>
                    <DialogTitle>Reserve Equipment</DialogTitle>
                </DialogHeader>
                {confirmation ? <Confirmation /> : step === 0 ? <Step1 /> : step === 1 ? <Step2 /> : <Step3 />}
            </DialogContent>
        </Dialog>
    )
} 