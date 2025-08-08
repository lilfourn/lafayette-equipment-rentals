"use client"

import { type Machine } from "@/components/machine-card"
import { generateFacets } from "@/lib/generate-facets"
import ClientFilterSidebar from "@/components/client-filter-sidebar"
import ClientMachineGrid from "@/components/client-machine-grid"
import { useFilteredMachines } from "@/hooks/use-filtered-machines"

interface EquipmentLayoutWrapperProps {
    machines: Machine[]
    fetchError?: string | null
    equipmentType?: string
}

export default function EquipmentLayoutWrapper({ machines, fetchError = null, equipmentType }: EquipmentLayoutWrapperProps) {
    // Apply URL-based filtering for sidebar filters (categories, makes, models, etc.)
    const filteredMachines = useFilteredMachines(machines)

    // const hasFilters = filteredMachines.length > 0

    return (
        <>
            {/* Machine Grid - Takes full width when no filters are shown */}
            <section className="col-span-full w-full">
                <ClientMachineGrid
                    machines={filteredMachines}
                    fetchError={fetchError}
                    equipmentType={equipmentType}
                />
            </section>
        </>
    )
} 