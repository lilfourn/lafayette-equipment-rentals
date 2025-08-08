"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import type { Machine } from "@/components/machine-card"

export function useFilteredMachines(machines: Machine[]) {
  const searchParams = useSearchParams()

  return useMemo(() => {
    let filtered = [...machines]

    // Filter by categories
    const categories = searchParams.getAll("category")
    if (categories.length > 0) {
      filtered = filtered.filter(machine => 
        categories.includes(machine.primaryType || "")
      )
    }

    // Filter by makes
    const makes = searchParams.getAll("make")
    if (makes.length > 0) {
      filtered = filtered.filter(machine => 
        makes.includes(machine.make || "")
      )
    }

    // Filter by models
    const models = searchParams.getAll("model")
    if (models.length > 0) {
      filtered = filtered.filter(machine => 
        models.includes(machine.model || "")
      )
    }

    // Filter by purchase options
    const purchaseOptions = searchParams.getAll("purchaseOptions")
    if (purchaseOptions.length > 0) {
      filtered = filtered.filter(machine => {
        return purchaseOptions.some(option => {
          if (option === "rpoEnabled") return machine.rpoEnabled === true
          if (option === "buyItNowEnabled") return machine.buyItNowEnabled === true
          return false
        })
      })
    }

    // Filter by hours range
    const minHours = searchParams.get("minHours")
    const maxHours = searchParams.get("maxHours")
    if (minHours || maxHours) {
      const min = minHours ? parseInt(minHours) : 0
      const max = maxHours ? parseInt(maxHours) : 375000
      filtered = filtered.filter(machine => {
        const hours = machine.hours || 0
        return hours >= min && hours <= max
      })
    }

    // Note: Weight filtering removed as weight property is not available in Machine interface

    return filtered
  }, [machines, searchParams])
} 