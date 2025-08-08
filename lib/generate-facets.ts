import { type Machine } from '@/components/machine-card'
import { type Facets } from '@/components/filter-sidebar'

export function generateFacets(machines: Machine[]): Facets {
    const facets: Facets = {
        primaryType: [],
        make: [],
        model: [],
        rpoEnabled: [],
        buyItNowEnabled: []
    }

    // Count occurrences for each facet
    const counts = {
        primaryType: new Map<string, number>(),
        make: new Map<string, number>(),
        model: new Map<string, number>(),
        rpoEnabled: new Map<boolean, number>(),
        buyItNowEnabled: new Map<boolean, number>()
    }

    machines.forEach(machine => {
        // Primary Type
        if (machine.primaryType) {
            counts.primaryType.set(machine.primaryType, (counts.primaryType.get(machine.primaryType) || 0) + 1)
        }

        // Make
        if (machine.make) {
            counts.make.set(machine.make, (counts.make.get(machine.make) || 0) + 1)
        }

        // Model
        if (machine.model) {
            counts.model.set(machine.model, (counts.model.get(machine.model) || 0) + 1)
        }

        // RPO Enabled
        if (machine.rpoEnabled !== undefined) {
            counts.rpoEnabled.set(machine.rpoEnabled, (counts.rpoEnabled.get(machine.rpoEnabled) || 0) + 1)
        }

        // Buy It Now Enabled
        if (machine.buyItNowEnabled !== undefined) {
            counts.buyItNowEnabled.set(machine.buyItNowEnabled, (counts.buyItNowEnabled.get(machine.buyItNowEnabled) || 0) + 1)
        }
    })

    // Convert counts to facet format and sort by count in descending order
    facets.primaryType = Array.from(counts.primaryType.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    facets.make = Array.from(counts.make.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    facets.model = Array.from(counts.model.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    facets.rpoEnabled = Array.from(counts.rpoEnabled.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    facets.buyItNowEnabled = Array.from(counts.buyItNowEnabled.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

    return facets
} 