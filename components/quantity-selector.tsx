"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Machine } from "./machine-card"

interface QuantitySelectorProps {
    machine: Machine
    maxQuantity: number
    onQuantityChange: (quantity: number) => void
    onAddToCart: (quantity: number) => void
    className?: string
}

export default function QuantitySelector({
    machine,
    maxQuantity,
    onQuantityChange,
    onAddToCart,
    className = ""
}: QuantitySelectorProps) {
    const [quantity, setQuantity] = useState(1)

    // Load saved quantity from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedQuantities = JSON.parse(localStorage.getItem("machineQuantities") || "{}")
            const savedQuantity = savedQuantities[machine.id]
            if (savedQuantity && savedQuantity <= maxQuantity) {
                setQuantity(savedQuantity)
                onQuantityChange(savedQuantity)
            }
        }
    }, [machine.id, maxQuantity, onQuantityChange])

    const handleQuantityChange = (newQuantity: number) => {
        const clampedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity))
        setQuantity(clampedQuantity)
        onQuantityChange(clampedQuantity)

        // Save to localStorage
        if (typeof window !== "undefined") {
            const savedQuantities = JSON.parse(localStorage.getItem("machineQuantities") || "{}")
            savedQuantities[machine.id] = clampedQuantity
            localStorage.setItem("machineQuantities", JSON.stringify(savedQuantities))
        }
    }

    const handleIncrement = () => {
        handleQuantityChange(quantity + 1)
    }

    const handleDecrement = () => {
        handleQuantityChange(quantity - 1)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1
        handleQuantityChange(value)
    }

    const handleAddToCart = () => {
        onAddToCart(quantity)
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Quantity</Label>
                <span className="text-xs text-gray-500">
                    {maxQuantity} available
                </span>
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                >
                    <Minus className="h-3 w-3" />
                </Button>

                <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={handleInputChange}
                    className="w-16 text-center h-8"
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleIncrement}
                    disabled={quantity >= maxQuantity}
                    className="h-8 w-8 p-0"
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>

            <Button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
            >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add {quantity} to Cart
            </Button>

            {quantity > 1 && (
                <div className="text-xs text-gray-600 text-center">
                    Total: {quantity} × {machine.make} {machine.model}
                </div>
            )}
        </div>
    )
} 