"use client"

import { type Machine } from "@/components/machine-card"
import { useFilteredMachines } from "@/hooks/use-filtered-machines"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import MachineGrid from "@/components/machine-grid"

interface ClientMachineGridProps {
    machines: Machine[]
    fetchError: string | null
    equipmentType?: string
}

export default function ClientMachineGrid({ machines, fetchError, equipmentType }: ClientMachineGridProps) {
    const searchParams = useSearchParams()
    const filteredMachines = useFilteredMachines(machines)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [buyItNowRequests, setBuyItNowRequests] = useState<string[]>([])
    const [isHydrated, setIsHydrated] = useState(false)

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true)
        const savedRequests = JSON.parse(localStorage.getItem("buyItNowRequests") || "[]")
        setBuyItNowRequests(savedRequests)
    }, [])

    useEffect(() => {
        setIsTransitioning(true)
        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, 200)
        return () => clearTimeout(timer)
    }, [searchParams])

    // Filter out buy it now requests only after hydration
    const finalMachines = isHydrated
        ? filteredMachines.filter(m => !buyItNowRequests.includes(m.id))
        : filteredMachines

    return (
        <div className={`transition-all duration-200 ease-in-out ${isTransitioning ? 'opacity-60' : 'opacity-100'
            }`}>
            <MachineGrid machines={finalMachines} fetchError={fetchError} equipmentType={equipmentType} />
        </div>
    )
} 