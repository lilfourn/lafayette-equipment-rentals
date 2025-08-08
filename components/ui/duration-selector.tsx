'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DurationSelectorProps {
    value: number // Duration in days
    onChange: (days: number) => void
    label?: string
    description?: string
    className?: string
}

type DurationUnit = 'days' | 'weeks' | 'months'

export default function DurationSelector({
    value,
    onChange,
    label = "Rental Duration",
    description = "This is only an estimate. Keep the machine as long as needed.",
    className = ""
}: DurationSelectorProps) {
    const [amount, setAmount] = useState(1)
    const [inputValue, setInputValue] = useState('1') // Separate state for input display
    const [unit, setUnit] = useState<DurationUnit>('weeks')

    // Convert days to appropriate unit and amount on mount and when value changes
    useEffect(() => {
        if (value <= 0) {
            setAmount(1)
            setInputValue('1')
            setUnit('weeks')
            return
        }

        // Determine best unit to display
        if (value >= 180) { // 6+ months
            setAmount(6)
            setInputValue('6')
            setUnit('months')
        } else if (value >= 30) { // 1+ months
            const months = Math.round(value / 30)
            setAmount(months)
            setInputValue(months.toString())
            setUnit('months')
        } else if (value >= 7) { // 1+ weeks
            const weeks = Math.round(value / 7)
            setAmount(weeks)
            setInputValue(weeks.toString())
            setUnit('weeks')
        } else { // Less than a week
            setAmount(value)
            setInputValue(value.toString())
            setUnit('days')
        }
    }, [value])

    const convertToDays = (amount: number, unit: DurationUnit): number => {
        switch (unit) {
            case 'days':
                return Math.max(1, Math.min(amount, 180)) // Max 6 months in days
            case 'weeks':
                return Math.max(7, Math.min(amount * 7, 180)) // Max 6 months
            case 'months':
                return Math.max(30, Math.min(amount * 30, 180)) // Max 6 months
            default:
                return 7
        }
    }

    const handleInputChange = (newValue: string) => {
        // Allow empty input while user is typing
        setInputValue(newValue)

        // Only update amount and call onChange if the value is valid
        if (newValue.trim() !== '') {
            const numAmount = parseInt(newValue) || 1
            setAmount(numAmount)
            const days = convertToDays(numAmount, unit)
            onChange(days)
        }
    }

    const handleInputBlur = () => {
        // When input loses focus, ensure we have a valid value
        if (inputValue.trim() === '' || parseInt(inputValue) < 1) {
            const defaultAmount = 1
            setInputValue(defaultAmount.toString())
            setAmount(defaultAmount)
            const days = convertToDays(defaultAmount, unit)
            onChange(days)
        }
    }

    const handleUnitChange = (newUnit: DurationUnit) => {
        setUnit(newUnit)
        // Use the current amount value, ensuring it's valid
        const currentAmount = parseInt(inputValue) || 1
        setAmount(currentAmount)
        setInputValue(currentAmount.toString())
        const days = convertToDays(currentAmount, newUnit)
        onChange(days)
    }

    const getMaxAmount = (): number => {
        switch (unit) {
            case 'days':
                return 180 // 6 months max
            case 'weeks':
                return 26 // ~6 months max
            case 'months':
                return 6 // 6 months max
            default:
                return 1
        }
    }

    const getDisplayAmount = (): string => {
        const maxAmount = getMaxAmount()
        if (amount >= maxAmount && unit === 'months' && maxAmount === 6) {
            return '6+'
        }
        return amount.toString()
    }

    // Quick select buttons for common durations
    const quickOptions = [
        { label: '1 Day', days: 1 },
        { label: '1 Week', days: 7 },
        { label: '2 Weeks', days: 14 },
        { label: '1 Month', days: 30 },
        { label: '3 Months', days: 90 },
        { label: '6 Months', days: 180 }
    ]

    return (
        <div className={cn("space-y-4", className)}>
            {label && (
                <div>
                    <Label className="text-base font-medium">{label}</Label>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    )}
                </div>
            )}

            {/* Quick Select Buttons */}
            <div className="space-y-2">
                <Label className="text-sm text-gray-900">Quick Select:</Label>
                <div className="grid grid-cols-3 gap-2">
                    {quickOptions.map((option) => (
                        <Button
                            key={option.days}
                            type="button"
                            variant={value === option.days ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "text-xs font-medium",
                                value === option.days
                                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                            )}
                            onClick={() => onChange(option.days)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Custom Duration Input */}
            <div className="space-y-2">
                <Label className="text-sm text-gray-900">Custom Duration:</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="number"
                            min="1"
                            max={getMaxAmount()}
                            value={inputValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onBlur={handleInputBlur}
                            placeholder="Amount"
                            className="text-center bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1">
                        <Select value={unit} onValueChange={handleUnitChange}>
                            <SelectTrigger className="bg-gray-100 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                                <SelectItem value="days" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Days</SelectItem>
                                <SelectItem value="weeks" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Weeks</SelectItem>
                                <SelectItem value="months" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Duration Summary */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                    Selected Duration: <span className="font-medium text-gray-900">
                        {getDisplayAmount()} {unit} ({value} days{value >= 180 ? '+' : ''})
                    </span>
                </div>
                {value >= 180 && (
                    <div className="text-xs text-blue-600 mt-1">
                        * Duration capped at 6 months for pricing estimate
                    </div>
                )}
            </div>
        </div>
    )
} 