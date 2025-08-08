"use client"

import { useFilteredMachines } from "@/hooks/use-filtered-machines"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { type Machine } from "@/components/machine-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import MachineCard from "@/components/machine-card"
import NoResults from "@/components/no-results"

interface ClientSkidSteersProps {
    machines: Machine[]
}

export default function ClientSkidSteers({ machines }: ClientSkidSteersProps) {
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
                <>
                    {/* Sort and Results Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <Select defaultValue="best-match">
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="best-match">Best Match</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-gray-600">
                            Showing 1-{Math.min(filteredMachines.length, 22)} of {filteredMachines.length}
                        </div>
                    </div>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMachines.map((machine) => (
                            <MachineCard key={machine.id} machine={machine} />
                        ))}
                    </div>
                </>
            ) : (
                <NoResults equipmentType="Skid Steer" />
            )}
        </div>
    )
}
