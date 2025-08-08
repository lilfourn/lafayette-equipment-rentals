"use client"

import { useFilteredMachines } from "@/hooks/use-filtered-machines"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import MachineCard, { type Machine } from "@/components/machine-card"
import NoResults from "@/components/no-results"

interface ClientFilteredMachinesProps {
    machines: Machine[]
}

export default function ClientFilteredMachines({ machines }: ClientFilteredMachinesProps) {
    const searchParams = useSearchParams()
    const filteredMachines = useFilteredMachines(machines)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        // Trigger transition when search params change
        setIsTransitioning(true)

        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, 200)

        return () => clearTimeout(timer)
    }, [searchParams])

    return (
        <div className={`transition-all duration-200 ease-in-out ${isTransitioning ? 'opacity-60' : 'opacity-100'
            }`}>
            {filteredMachines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMachines.map((machine) => (
                        <MachineCard key={machine.id} machine={machine} />
                    ))}
                </div>
            ) : (
                <NoResults equipmentType={undefined} />
            )}
        </div>
    )
}
