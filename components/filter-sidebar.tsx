"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { getCategoryImage } from "@/lib/categories"
import { useTranslations } from "next-intl"

interface FacetValue {
  value: string | boolean
  count: number
}

export interface Facets {
  primaryType?: FacetValue[]
  make?: FacetValue[]
  model?: FacetValue[]
  rpoEnabled?: FacetValue[]
  buyItNowEnabled?: FacetValue[]
}

interface FilterSidebarProps {
  facets: Facets
}

export default function FilterSidebar({ facets }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations()

  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllMakes, setShowAllMakes] = useState(false)
  const [showAllModels, setShowAllModels] = useState(false)

  // Local state for sliders to show immediate feedback
  const [hoursRange, setHoursRange] = useState([
    parseInt(searchParams?.get("minHours") || "0"),
    parseInt(searchParams?.get("maxHours") || "375000")
  ])
  const [weightRange, setWeightRange] = useState([
    parseInt(searchParams?.get("minWeight") || "0"),
    parseInt(searchParams?.get("maxWeight") || "250000")
  ])

  // Update local state when URL params change
  useEffect(() => {
    setHoursRange([
      parseInt(searchParams?.get("minHours") || "0"),
      parseInt(searchParams?.get("maxHours") || "375000")
    ])
    setWeightRange([
      parseInt(searchParams?.get("minWeight") || "0"),
      parseInt(searchParams?.get("maxWeight") || "250000")
    ])
  }, [searchParams])

  const createQueryString = useCallback(
    (paramsToUpdate: { name: string; value: string }[]) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      paramsToUpdate.forEach(({ name, value }) => {
        if (value) {
          params.set(name, value)
        } else {
          params.delete(name)
        }
      })
      return params.toString()
    },
    [searchParams],
  )

  const handleCheckboxChange = (name: string, checked: boolean | string, value: string) => {
    if (!searchParams || !pathname || !router) return

    const params = new URLSearchParams(searchParams.toString())
    const existing = params.getAll(name)

    if (checked) {
      if (!existing.includes(value)) {
        params.append(name, value)
      }
    } else {
      const newValues = existing.filter((v) => v !== value)
      params.delete(name)
      newValues.forEach((v) => params.append(name, v))

      // Clear child filters when parent filter is removed
      if (name === "category" && searchParams?.getAll("category").filter(c => c !== value).length === 0) {
        // If removing the last category, clear all makes
        params.delete("make")
      }
      if (name === "purchaseOptions" && searchParams?.getAll("purchaseOptions").filter(p => p !== value).length === 0) {
        // If removing the last purchase option, clear all models
        params.delete("model")
      }
    }

    // Update URL without page refresh for client-side filtering
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }

  const clearFilters = (filterNames: string[]) => {
    if (!searchParams || !pathname || !router) return

    const params = new URLSearchParams(searchParams.toString())
    filterNames.forEach(name => params.delete(name))
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }

  const handleRadiusChange = (value: string) => {
    if (!searchParams || !pathname || !router) return

    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("radius", value)
    } else {
      params.delete("radius")
    }

    // Update URL without page refresh for client-side filtering
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl, { scroll: false })
  }

  const currentRadius = searchParams?.get("radius") || "50"

  const categories = facets.primaryType?.filter((f) => typeof f.value === "string") || []
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8)

  // Always show makes and models (remove conditional logic)
  const selectedMakes = searchParams?.getAll("make") || []
  const makes = facets.make?.filter((f) => typeof f.value === "string") || []

  const selectedModels = searchParams?.getAll("model") || []
  const models = facets.model?.filter((f) => typeof f.value === "string") || []

  return (
    <div className="w-full overflow-x-hidden bg-white rounded-lg p-6 border border-gray-200">
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold text-gray-900">Location Radius</Label>
          <Select value={currentRadius} onValueChange={handleRadiusChange}>
            <SelectTrigger className="mt-2 bg-gray-100 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select radius" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="10" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Within 10 miles</SelectItem>
              <SelectItem value="25" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Within 25 miles</SelectItem>
              <SelectItem value="50" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Within 50 miles</SelectItem>
              <SelectItem value="100" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Within 100 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Equipment Category</h3>
          <div className="space-y-3">
            {visibleCategories.map(({ value, count }) => {
              const isChecked = searchParams?.getAll("category").includes(value as string) || false
              return (
                <div
                  key={value as string}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg cursor-pointer select-none touch-manipulation hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
                  onClick={() => handleCheckboxChange("category", !isChecked, value as string)}
                >
                  <div className="flex items-center gap-3 flex-1 pointer-events-none">
                    <Image
                      src={getCategoryImage(value as string) || "/placeholder.svg?width=40&height=40&query=equipment"}
                      alt={value as string}
                      width={40}
                      height={40}
                      className="rounded-full bg-gray-100 object-contain"
                    />
                    <Label htmlFor={`cat-${value}`} className="font-normal cursor-pointer text-gray-700">
                      {value as string} ({count})
                    </Label>
                  </div>
                  <Checkbox
                    id={`cat-${value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange("category", checked, value as string)}
                    className="pointer-events-none bg-white border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </div>
              )
            })}
          </div>
          {categories.length > 8 && (
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 px-0 mt-2"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? "Show Less" : `Show More (${categories.length - 8})`}
            </Button>
          )}
        </div>

        {/* Make Filter - Always visible */}
        {makes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Make</h3>
              {selectedMakes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  onClick={() => clearFilters(["make"])}
                >
                  {t("common.clear")}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {(showAllMakes ? makes : makes.slice(0, 8)).map(({ value, count }) => {
                const isChecked = searchParams?.getAll("make").includes(value as string) || false
                return (
                  <div
                    key={value as string}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg cursor-pointer select-none touch-manipulation hover:bg-gray-700 focus-visible:bg-gray-700 active:bg-gray-600 transition-colors duration-150"
                    onClick={() => handleCheckboxChange("make", !isChecked, value as string)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCheckboxChange("make", !isChecked, value as string)
                      }
                    }}
                  >
                    <Label htmlFor={`make-${value}`} className="font-normal cursor-pointer flex-1 pointer-events-none text-gray-200">
                      {value as string} ({count})
                    </Label>
                    <Checkbox
                      id={`make-${value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange("make", checked, value as string)}
                      className="pointer-events-none bg-white border-gray-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                  </div>
                )
              })}
            </div>
            {makes.length > 8 && (
              <Button
                variant="link"
                className="text-orange-400 hover:text-orange-300 px-0 mt-2"
                onClick={() => setShowAllMakes(!showAllMakes)}
              >
                {showAllMakes ? "Show Less" : `Show More (${makes.length - 8})`}
              </Button>
            )}
          </div>
        )}

        {/* Model Filter - Always visible */}
        {models.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Model</h3>
              {selectedModels.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  onClick={() => clearFilters(["model"])}
                >
                  {t("common.clear")}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {(showAllModels ? models : models.slice(0, 8)).map(({ value, count }) => {
                const isChecked = searchParams?.getAll("model").includes(value as string) || false
                return (
                  <div
                    key={value as string}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg cursor-pointer select-none touch-manipulation hover:bg-gray-700 focus-visible:bg-gray-700 active:bg-gray-600 transition-colors duration-150"
                    onClick={() => handleCheckboxChange("model", !isChecked, value as string)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCheckboxChange("model", !isChecked, value as string)
                      }
                    }}
                  >
                    <Label htmlFor={`model-${value}`} className="font-normal cursor-pointer flex-1 pointer-events-none text-gray-200">
                      {value as string} ({count})
                    </Label>
                    <Checkbox
                      id={`model-${value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange("model", checked, value as string)}
                      className="pointer-events-none bg-white border-gray-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                  </div>
                )
              })}
            </div>
            {models.length > 8 && (
              <Button
                variant="link"
                className="text-orange-400 hover:text-orange-300 px-0 mt-2"
                onClick={() => setShowAllModels(!showAllModels)}
              >
                {showAllModels ? "Show Less" : `Show More (${models.length - 8})`}
              </Button>
            )}
          </div>
        )}

        {/* Purchase Options - More prominent */}
        {(() => {
          const rpoCount = facets.rpoEnabled?.find(f => f.value === true)?.count || 0
          const buyItNowCount = facets.buyItNowEnabled?.find(f => f.value === true)?.count || 0
          const showRentToOwn = rpoCount > 0
          const showBuyItNow = buyItNowCount > 0

          // Only show the Purchase Options section if at least one option has results
          if (!showRentToOwn && !showBuyItNow) return null

          return (
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-600/30">
              <h3 className="text-base font-semibold text-orange-300 mb-3 flex items-center">
                Purchase Options
              </h3>
              <div className="space-y-3">
                {showRentToOwn && (
                  <div
                    className="flex items-center space-x-2 p-2 -mx-2 rounded-lg cursor-pointer select-none touch-manipulation hover:bg-orange-800/30 active:bg-orange-800/50 transition-colors duration-150"
                    onClick={() => {
                      const isChecked = searchParams?.getAll("purchaseOptions").includes("rpoEnabled") || false
                      handleCheckboxChange("purchaseOptions", !isChecked, "rpoEnabled")
                    }}
                  >
                    <Checkbox
                      id="rpoEnabled"
                      checked={searchParams?.getAll("purchaseOptions").includes("rpoEnabled") || false}
                      onCheckedChange={(checked) => handleCheckboxChange("purchaseOptions", checked, "rpoEnabled")}
                      className="pointer-events-none border-orange-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                    <Label htmlFor="rpoEnabled" className="font-medium text-orange-200 cursor-pointer flex-1 pointer-events-none">
                      Rent to Own ({rpoCount})
                    </Label>
                  </div>
                )}
                {showBuyItNow && (
                  <div
                    className="flex items-center space-x-2 p-2 -mx-2 rounded-lg cursor-pointer select-none touch-manipulation hover:bg-orange-800/30 active:bg-orange-800/50 transition-colors duration-150"
                    onClick={() => {
                      const isChecked = searchParams?.getAll("purchaseOptions").includes("buyItNowEnabled") || false
                      handleCheckboxChange("purchaseOptions", !isChecked, "buyItNowEnabled")
                    }}
                  >
                    <Checkbox
                      id="buyItNowEnabled"
                      checked={searchParams?.getAll("purchaseOptions").includes("buyItNowEnabled") || false}
                      onCheckedChange={(checked) => handleCheckboxChange("purchaseOptions", checked, "buyItNowEnabled")}
                      className="pointer-events-none border-orange-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                    <Label htmlFor="buyItNowEnabled" className="font-medium text-orange-200 cursor-pointer flex-1 pointer-events-none">
                      Buy It Now ({buyItNowCount})
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Hours</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-200 font-medium">
              {hoursRange[0].toLocaleString()} - {hoursRange[1].toLocaleString()} hrs
            </div>
            <Slider
              value={hoursRange}
              max={375000}
              step={1000}
              className="[&_[role=slider]]:bg-orange-600 [&_[role=slider]]:border-orange-600 [&_.rc-slider-track]:bg-orange-600"
              onValueChange={(value) => {
                setHoursRange(value)
              }}
              onValueCommit={(value) => {
                if (!searchParams || !pathname || !router) return
                const params = new URLSearchParams(searchParams.toString())
                if (value[0] > 0) params.set("minHours", value[0].toString())
                else params.delete("minHours")
                if (value[1] < 375000) params.set("maxHours", value[1].toString())
                else params.delete("maxHours")
                const queryString = params.toString()
                const newUrl = queryString ? `${pathname}?${queryString}` : pathname
                router.push(newUrl, { scroll: false })
              }}
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>0 hrs</span>
              <span>375,000 hrs</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Weight (lbs)</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-200 font-medium">
              {weightRange[0].toLocaleString()} - {weightRange[1].toLocaleString()} lbs
            </div>
            <Slider
              value={weightRange}
              max={250000}
              step={2500}
              className="[&_[role=slider]]:bg-orange-600 [&_[role=slider]]:border-orange-600 [&_.rc-slider-track]:bg-orange-600"
              onValueChange={(value) => {
                setWeightRange(value)
              }}
              onValueCommit={(value) => {
                if (!searchParams || !pathname || !router) return
                const params = new URLSearchParams(searchParams.toString())
                if (value[0] > 0) params.set("minWeight", value[0].toString())
                else params.delete("minWeight")
                if (value[1] < 250000) params.set("maxWeight", value[1].toString())
                else params.delete("maxWeight")
                const queryString = params.toString()
                const newUrl = queryString ? `${pathname}?${queryString}` : pathname
                router.push(newUrl, { scroll: false })
              }}
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>0 lbs</span>
              <span>250,000 lbs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
