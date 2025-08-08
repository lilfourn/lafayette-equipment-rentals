"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DurationSelector from "@/components/ui/duration-selector"
import { addDays } from "date-fns"

interface DatePickerModalProps {
    isOpen: boolean
    onClose: () => void
    onDateSelect: (rentalData: {
        startDate: Date
        duration: number
        zipCode: string
        dropOffTime: string
        pickupTime: string
    }) => void
    initialStartDate?: Date
    initialDuration?: number
    initialZipCode?: string
    initialDropOffTime?: string
    initialPickupTime?: string
}

export default function DatePickerModal({
    isOpen,
    onClose,
    onDateSelect,
    initialStartDate,
    initialDuration = 7,
    initialZipCode = "",
    initialDropOffTime = "morning",
    initialPickupTime = "morning"
}: DatePickerModalProps) {
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(initialStartDate || null)
    const [duration, setDuration] = useState(initialDuration)
    const [zipCode, setZipCode] = useState(initialZipCode)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [dropOffTime, setDropOffTime] = useState(initialDropOffTime)
    const [pickupTime, setPickupTime] = useState(initialPickupTime)

    // Set default start date if none provided (today)
    useEffect(() => {
        if (!selectedStartDate) {
            const today = new Date()
            setSelectedStartDate(today)
        }
    }, [selectedStartDate])

    // Check if a date is within 30 days from today
    const isDateWithin30Days = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Start of today

        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(today.getDate() + 30)
        thirtyDaysFromNow.setHours(23, 59, 59, 999) // End of 30th day

        return date >= today && date <= thirtyDaysFromNow
    }

    // Check if a date is in the past
    const isDateInPast = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    // Check if a date is more than 30 days in the future
    const isDateMoreThan30DaysAhead = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(today.getDate() + 30)
        thirtyDaysFromNow.setHours(23, 59, 59, 999)

        return date > thirtyDaysFromNow
    }

    const formatDate = (date: Date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayOfMonth = new Date(year, month, 1).getDay()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    const isSameDay = (date1: Date | null, date2: Date | null) => {
        if (!date1 || !date2) return false
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
    }

    const handleDateClick = (date: Date) => {
        setSelectedStartDate(date)
    }

    const handleSave = () => {
        if (selectedStartDate && zipCode.trim()) {
            // Save rental data to localStorage for checkout
            const rentalData = {
                startDate: selectedStartDate,
                duration: duration,
                zipCode: zipCode.trim(),
                dropOffTime: dropOffTime,
                pickupTime: pickupTime
            }

            if (typeof window !== "undefined") {
                localStorage.setItem("rentalData", JSON.stringify(rentalData))
            }

            onDateSelect(rentalData)
            onClose()
        }
    }

    const nextMonth = () => {
        const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        setCurrentMonth(nextMonthDate)
    }

    const prevMonth = () => {
        const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        setCurrentMonth(prevMonthDate)
    }

    const currentMonthDays = getDaysInMonth(currentMonth)

    const calculateEndDate = () => {
        if (!selectedStartDate) return null
        return addDays(selectedStartDate, duration - 1)
    }

    const endDate = calculateEndDate()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl p-4 sm:p-6">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Set Expected Start Date
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 sm:space-y-8">
                    {/* Calendar */}
                    <div>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prevMonth}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 text-center">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={nextMonth}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-7 gap-0 mb-2 sm:mb-3">
                            {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                                <div key={day} className="text-center py-1 sm:py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-0">
                            {currentMonthDays.map((date, index) => {
                                const isDisabled = !date || isDateInPast(date) || isDateMoreThan30DaysAhead(date)
                                const isSelected = isSameDay(date, selectedStartDate)

                                return (
                                    <button
                                        key={index}
                                        className={`h-8 sm:h-10 text-xs sm:text-sm font-medium transition-colors ${!date
                                            ? 'invisible'
                                            : isSelected
                                                ? 'bg-gray-900 text-white rounded-full'
                                                : isDisabled
                                                    ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        onClick={() => date && !isDisabled && handleDateClick(date)}
                                        disabled={isDisabled}
                                    >
                                        {date?.getDate()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Duration Selector */}
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <DurationSelector
                            value={duration}
                            onChange={setDuration}
                            label="Rental Duration"
                            description="This is only an estimate. Keep the machine as long as needed."
                        />
                    </div>

                    {/* Zip Code Input */}
                    <div>
                        <Label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                            Zip Code
                        </Label>
                        <Input
                            id="zipCode"
                            type="text"
                            placeholder="Enter your zip code"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full h-10 sm:h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                            maxLength={10}
                        />
                    </div>

                    {/* Information Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                            Your End Date is assumed to be approximate. Rentals will remain on rent until you schedule a pickup.
                        </p>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                Drop-off Time
                            </label>
                            <Select value={dropOffTime} onValueChange={setDropOffTime}>
                                <SelectTrigger className="w-full h-10 sm:h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (7-10 AM Approx.)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (1-4 PM Approx.)</SelectItem>
                                    <SelectItem value="evening">Evening (5-8 PM Approx.)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                Pickup Time
                            </label>
                            <Select value={pickupTime} onValueChange={setPickupTime}>
                                <SelectTrigger className="w-full h-10 sm:h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (7-10 AM Approx.)</SelectItem>
                                    <SelectItem value="afternoon">Afternoon (1-4 PM Approx.)</SelectItem>
                                    <SelectItem value="evening">Evening (5-8 PM Approx.)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                        <Button
                            onClick={handleSave}
                            className="flex-1 h-10 sm:h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm"
                            disabled={!selectedStartDate || !zipCode.trim()}
                        >
                            SAVE
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-10 sm:h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm"
                        >
                            CANCEL
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 