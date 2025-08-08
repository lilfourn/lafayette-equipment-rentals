"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, ChevronRight, Search, Filter, X, ShoppingCart } from "lucide-react"
import MachineCard, { type Machine } from "./machine-card"
import NoResults from "./no-results"
import MachineGridSkeleton from "./skeletons/machine-grid-skeleton"

interface MachineGridProps {
    machines: Machine[]
    fetchError: string | null
    initialSearchQuery?: string
    equipmentType?: string
}

interface GroupedMachine {
    machine: Machine
    quantity: number
    allMachines: Machine[]
}

// Helper function to get rental rates - moved outside component
const getRentalRates = (machine: Machine) => {
    let daily: number | undefined, weekly: number | undefined, monthly: number | undefined;

    if (typeof machine.rentalRate === 'number') {
        monthly = machine.rentalRate;
    } else if (machine.rentalRate && typeof machine.rentalRate === 'object') {
        daily = machine.rentalRate.daily;
        weekly = machine.rentalRate.weekly;
        monthly = machine.rentalRate.monthly;
    }

    if (machine.rateSchedules) {
        machine.rateSchedules.forEach(schedule => {
            if (schedule.label === 'DAY' && schedule.numDays === 1) {
                daily = schedule.cost;
            } else if (schedule.label === 'WEEK' && schedule.numDays === 7) {
                weekly = schedule.cost;
            } else if (schedule.label.includes('MOS') || schedule.numDays >= 28) {
                if (!monthly || schedule.numDays <= 31) {
                    monthly = schedule.cost;
                }
            }
        });
    }

    daily = (daily && daily > 0) ? daily : undefined;
    weekly = (weekly && weekly > 0) ? weekly : undefined;
    monthly = (monthly && monthly > 0) ? monthly : undefined;

    return { daily, weekly, monthly };
}

export default function MachineGrid({ 
  machines, 
  fetchError, 
  initialSearchQuery, 
  equipmentType,
  viewMode = "grid",
  showFilters: showFiltersProp = true,
  enableSearch = false,
  searchPlaceholder = "Search equipment...",
  initialItemsToShow = 12,
  locale = "en"
}: MachineGridProps & {
  viewMode?: "grid" | "list";
  showFilters?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  initialItemsToShow?: number;
  locale?: string;
}) {
    // All hooks at the top
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "")
    const [appliedSearchQuery, setAppliedSearchQuery] = useState(initialSearchQuery || "")
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedMakes, setSelectedMakes] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("rental-first")

    // Force the sort to be applied on component mount
    useEffect(() => {
        setSortBy("rental-first")
        console.log('Setting sort to rental-first on mount')
    }, [])
    const [showFilters, setShowFilters] = useState(showFiltersProp)
    const [buyItNowFilter, setBuyItNowFilter] = useState<boolean | null>(null)
    const [rentToOwnFilter, setRentToOwnFilter] = useState<boolean | null>(null)
    const [hoursRange, setHoursRange] = useState<number[]>([0, 10000])
    const [weightRange, setWeightRange] = useState<number[]>([0, 100000])
    const [isLoading, setIsLoading] = useState(true)

    const machinesPerPage = 9 // 3 rows × 3 columns on desktop

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (initialSearchQuery !== undefined) {
            setSearchQuery(initialSearchQuery)
            setAppliedSearchQuery(initialSearchQuery)
        }
    }, [initialSearchQuery])

    const equipmentTypesWithCounts = useMemo(() => {
        const typeCounts = machines.reduce((acc, machine) => {
            if (machine.primaryType) {
                acc[machine.primaryType] = (acc[machine.primaryType] || 0) + 1
            }
            return acc
        }, {} as Record<string, number>)
        return Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => ({ type, count }))
    }, [machines])

    const filteredMakes = useMemo(() => {
        if (selectedTypes.length === 0) {
            const makesList = [...new Set(machines.map(m => m.make).filter(Boolean))]
            return makesList.sort()
        } else {
            const filteredMachines = machines.filter(machine =>
                machine.primaryType && selectedTypes.includes(machine.primaryType)
            )
            const makesList = [...new Set(filteredMachines.map(m => m.make).filter(Boolean))]
            return makesList.sort()
        }
    }, [machines, selectedTypes])

    const filteredEquipmentTypes = useMemo(() => {
        if (selectedMakes.length === 0) {
            return equipmentTypesWithCounts
        } else {
            const filteredMachines = machines.filter(machine =>
                machine.make && selectedMakes.includes(machine.make)
            )
            const typeCounts = filteredMachines.reduce((acc, machine) => {
                if (machine.primaryType) {
                    acc[machine.primaryType] = (acc[machine.primaryType] || 0) + 1
                }
                return acc
            }, {} as Record<string, number>)
            return Object.entries(typeCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => ({ type, count }))
        }
    }, [machines, selectedMakes, equipmentTypesWithCounts])

    const purchaseOptionCounts = useMemo(() => {
        const buyItNowCount = machines.filter(machine => machine.buyItNowEnabled && machine.buyItNowPrice && machine.buyItNowPrice > 0).length
        const rentToOwnCount = machines.filter(machine => machine.rpoEnabled).length
        return { buyItNowCount, rentToOwnCount }
    }, [machines])

    const groupedMachines = useMemo(() => {
        const groups = new Map<string, GroupedMachine>()
        machines.forEach(machine => {
            // Group all machines (including Buy It Now) by make, model, type, and rates
            const { daily, weekly, monthly } = getRentalRates(machine)
            const key = `${machine.make}-${machine.model}-${machine.primaryType}-${daily}-${weekly}-${monthly}`
            if (groups.has(key)) {
                const group = groups.get(key)!
                group.quantity += 1
                group.allMachines.push(machine)
                const years = group.allMachines.map(m => m.year).filter((year): year is number => year !== undefined && year > 0).sort((a, b) => a - b)
                if (years.length > 0) {
                    const medianIndex = Math.floor(years.length / 2)
                    const medianYear = years.length % 2 === 0
                        ? Math.round((years[medianIndex - 1]! + years[medianIndex]!) / 2)
                        : years[medianIndex]!
                    group.machine = {
                        ...group.machine,
                        year: medianYear
                    }
                }
            } else {
                groups.set(key, {
                    machine,
                    quantity: 1,
                    allMachines: [machine]
                })
            }
        })
        return Array.from(groups.values())
    }, [machines])

    const filteredGroupedMachines = useMemo(() => {
        let filtered = groupedMachines.filter(group => {
            const machine = group.machine
            const searchMatch = !appliedSearchQuery ||
                machine.make?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
                machine.model?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
                machine.primaryType?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
                machine.displayName?.toLowerCase().includes(appliedSearchQuery.toLowerCase())
            const typeMatch = selectedTypes.length === 0 ||
                (machine.primaryType && selectedTypes.includes(machine.primaryType))
            const makeMatch = selectedMakes.length === 0 ||
                (machine.make && selectedMakes.includes(machine.make))
            let priceMatch = true
            if (priceRange !== "all") {
                const { daily } = getRentalRates(machine)
                if (daily) {
                    switch (priceRange) {
                        case "under-100":
                            priceMatch = daily < 100
                            break
                        case "100-500":
                            priceMatch = daily >= 100 && daily <= 500
                            break
                        case "500-1000":
                            priceMatch = daily > 500 && daily <= 1000
                            break
                        case "over-1000":
                            priceMatch = daily > 1000
                            break
                    }
                }
            }
            let buyItNowMatch = true
            if (buyItNowFilter !== null) {
                buyItNowMatch = machine.buyItNowEnabled === buyItNowFilter
            }
            let rentToOwnMatch = true
            if (rentToOwnFilter !== null) {
                rentToOwnMatch = machine.rpoEnabled === rentToOwnFilter
            }
            let hoursMatch = true
            const hours = machine.usage || machine.hours || 0
            if (hours > 0) {
                hoursMatch = hours >= hoursRange[0] && hours <= hoursRange[1]
            }
            return searchMatch && typeMatch && makeMatch && priceMatch && buyItNowMatch && rentToOwnMatch && hoursMatch
        })
        // Debug: Log first few machines before and after sorting
        if (sortBy === "rental-first") {
            console.log('Before sorting - first 5 machines:', filtered.slice(0, 5).map(g => ({
                make: g.machine.make,
                model: g.machine.model,
                buyItNow: Boolean(g.machine.buyItNowEnabled && g.machine.buyItNowPrice && g.machine.buyItNowPrice > 0),
                enabled: g.machine.buyItNowEnabled,
                price: g.machine.buyItNowPrice
            })));
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "rental-first": {
                    // Rental equipment (not buy-it-now) should come first
                    const aIsBuyItNow = Boolean(a.machine.buyItNowEnabled && a.machine.buyItNowPrice && a.machine.buyItNowPrice > 0);
                    const bIsBuyItNow = Boolean(b.machine.buyItNowEnabled && b.machine.buyItNowPrice && b.machine.buyItNowPrice > 0);

                    // Rental equipment (false) should come before Buy It Now (true)
                    // So if aIsBuyItNow is true and bIsBuyItNow is false, a should come after b (return 1)
                    // If aIsBuyItNow is false and bIsBuyItNow is true, a should come before b (return -1)
                    if (aIsBuyItNow !== bIsBuyItNow) {
                        return aIsBuyItNow ? 1 : -1;
                    }

                    // If both are the same type (both rental or both buy-it-now), sort by name
                    return (a.machine.make + " " + a.machine.model).localeCompare(b.machine.make + " " + b.machine.model);
                }
                case "name":
                    return (a.machine.make + " " + a.machine.model).localeCompare(b.machine.make + " " + b.machine.model)
                case "type":
                    return (a.machine.primaryType || "").localeCompare(b.machine.primaryType || "")
                case "price-low":
                    const aRate = getRentalRates(a.machine).daily || 0
                    const bRate = getRentalRates(b.machine).daily || 0
                    return aRate - bRate
                case "price-high":
                    const aRateHigh = getRentalRates(a.machine).daily || 0
                    const bRateHigh = getRentalRates(b.machine).daily || 0
                    return bRateHigh - aRateHigh
                case "quantity":
                    return b.quantity - a.quantity
                default:
                    return 0
            }
        })

        // Debug: Log first few machines after sorting
        if (sortBy === "rental-first") {
            console.log('After sorting - first 5 machines:', filtered.slice(0, 5).map(g => ({
                make: g.machine.make,
                model: g.machine.model,
                buyItNow: Boolean(g.machine.buyItNowEnabled && g.machine.buyItNowPrice && g.machine.buyItNowPrice > 0),
                enabled: g.machine.buyItNowEnabled,
                price: g.machine.buyItNowPrice
            })));
        }

        return filtered
    }, [groupedMachines, appliedSearchQuery, selectedTypes, selectedMakes, priceRange, sortBy, buyItNowFilter, rentToOwnFilter, hoursRange])

    const totalPages = Math.ceil(filteredGroupedMachines.length / machinesPerPage)
    const startIndex = (currentPage - 1) * machinesPerPage
    const endIndex = startIndex + machinesPerPage
    const currentGroupedMachines = filteredGroupedMachines.slice(startIndex, endIndex)

    const handleFilterChange = () => {
        setCurrentPage(1)
    }
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
    }
    const handleSearchSubmit = () => {
        setAppliedSearchQuery(searchQuery)
        setCurrentPage(1)
    }
    const handleTypeChange = (type: string, checked: boolean) => {
        if (checked) {
            setSelectedTypes(prev => [...prev, type])
        } else {
            setSelectedTypes(prev => prev.filter(t => t !== type))
        }
        handleFilterChange()
    }
    const handleMakeChange = (make: string, checked: boolean) => {
        if (checked) {
            setSelectedMakes(prev => [...prev, make])
        } else {
            setSelectedMakes(prev => prev.filter(m => m !== make))
        }
        handleFilterChange()
    }
    const clearAllFilters = () => {
        setSearchQuery("")
        setAppliedSearchQuery("")
        setSelectedTypes([])
        setSelectedMakes([])
        setPriceRange("all")
        setSortBy("rental-first")
        setBuyItNowFilter(null)
        setRentToOwnFilter(null)
        setHoursRange([0, 10000])
        setWeightRange([0, 100000])
        setCurrentPage(1)
    }

    // Only after all hooks, check for loading or error
    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading equipment...</p>
                </div>
            </div>
        )
    }
    if (fetchError) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading machines: {fetchError}</p>
            </div>
        )
    }

    // Show skeleton while loading
    if (isLoading && machines.length === 0) {
        return <MachineGridSkeleton showFilters={true} itemCount={9} />
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Available Equipment</h1>
                            <p className="text-lg text-gray-600">
                                Browse our extensive inventory of professional-grade equipment
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {filteredGroupedMachines.length} unique models of {machines.length} total machines
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <Button
                                variant={showFilters ? "default" : "outline"}
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden border-gray-300 hover:border-gray-400"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {showFilters ? "Hide Filters" : "Show Filters"}
                            </Button>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-56 h-12 border-gray-300 bg-white text-gray-900 font-medium hover:border-gray-400 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 transition-colors">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                    <SelectItem value="rental-first" className="hover:bg-gray-50 focus:bg-turquoise-50 focus:text-turquoise-700">
                                        <span className="font-medium">Rental Equipment First</span>
                                    </SelectItem>
                                    <SelectItem value="name" className="hover:bg-gray-50 focus:bg-turquoise-50 focus:text-turquoise-700">Sort by Name</SelectItem>
                                    <SelectItem value="type" className="hover:bg-gray-50 focus:bg-turquoise-50 focus:text-turquoise-700">Sort by Type</SelectItem>
                                    <SelectItem value="price-low" className="hover:bg-gray-50 focus:bg-turquoise-50 focus:text-turquoise-700">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high" className="hover:bg-gray-50 focus:bg-turquoise-50 focus:text-turquoise-700">Price: High to Low</SelectItem>
                                    <SelectItem value="quantity" className="hover:bg-gray-50 focus:bg-turquoise-50 focus:text-turquoise-700">Most Available</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <div className={`${showFilters ? 'fixed lg:relative inset-0 z-50 lg:z-auto bg-gray-50 lg:bg-transparent p-4 lg:p-0 overflow-y-auto' : 'hidden lg:block'} lg:w-64 flex-shrink-0`}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                                    <div className="flex items-center gap-3">
                                        {(selectedTypes.length > 0 || selectedMakes.length > 0 || buyItNowFilter !== null || rentToOwnFilter !== null || priceRange !== "all") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Clear all
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowFilters(false)}
                                            className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-6">



                            {/* Purchase Options */}
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-3">Purchase Options</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer group py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                                        <Checkbox
                                            id="buy-it-now"
                                            checked={buyItNowFilter === true}
                                            onCheckedChange={(checked) => setBuyItNowFilter(checked ? true : null)}
                                            className="w-4 h-4 border border-gray-300 rounded data-[state=checked]:bg-turquoise-600 data-[state=checked]:border-turquoise-600 transition-colors"
                                        />
                                        <span className="text-xs text-gray-700 group-hover:text-gray-900 flex-1">
                                            Buy It Now Available
                                        </span>
                                        <span className="text-xs font-medium text-gray-500">({purchaseOptionCounts.buyItNowCount})</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer group py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                                        <Checkbox
                                            id="rent-to-own"
                                            checked={rentToOwnFilter === true}
                                            onCheckedChange={(checked) => setRentToOwnFilter(checked ? true : null)}
                                            className="w-4 h-4 border border-gray-300 rounded data-[state=checked]:bg-turquoise-600 data-[state=checked]:border-turquoise-600 transition-colors"
                                        />
                                        <span className="text-xs text-gray-700 group-hover:text-gray-900 flex-1">
                                            Rent to Own Available
                                        </span>
                                        <span className="text-xs font-medium text-gray-500">({purchaseOptionCounts.rentToOwnCount})</span>
                                    </label>
                                </div>
                            </div>

                            {/* Equipment Type Filter */}
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-3">Equipment Type</h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                    {filteredEquipmentTypes.map(({ type, count }) => (
                                        <label key={type} className="flex items-center space-x-2 cursor-pointer group py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                                            <Checkbox
                                                id={`type-${type}`}
                                                checked={selectedTypes.includes(type)}
                                                onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                                                className="w-4 h-4 border border-gray-300 rounded data-[state=checked]:bg-turquoise-600 data-[state=checked]:border-turquoise-600 transition-colors"
                                            />
                                            <span className="text-xs text-gray-700 group-hover:text-gray-900 flex-1">
                                                {type}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500">({count})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Make Filter */}
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-3">Make</h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                    {filteredMakes.map((make) => (
                                        <label key={make} className="flex items-center space-x-2 cursor-pointer group py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                                            <Checkbox
                                                id={`make-${make}`}
                                                checked={selectedMakes.includes(make)}
                                                onCheckedChange={(checked) => handleMakeChange(make, checked as boolean)}
                                                className="w-4 h-4 border border-gray-300 rounded data-[state=checked]:bg-turquoise-600 data-[state=checked]:border-turquoise-600 transition-colors"
                                            />
                                            <span className="text-xs text-gray-700 group-hover:text-gray-900">
                                                {make}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-3">Daily Rate</h4>
                                <Select value={priceRange} onValueChange={setPriceRange}>
                                    <SelectTrigger className="w-full h-9 text-xs border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-turquoise-500 focus:border-turquoise-500 rounded-lg bg-white transition-colors">
                                        <SelectValue placeholder="All Prices" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                                        <SelectItem value="all" className="hover:bg-gray-50 focus:bg-turquoise-50 cursor-pointer py-1.5 text-xs">All Prices</SelectItem>
                                        <SelectItem value="under-100" className="hover:bg-gray-50 focus:bg-turquoise-50 cursor-pointer py-1.5 text-xs">Under $100</SelectItem>
                                        <SelectItem value="100-500" className="hover:bg-gray-50 focus:bg-turquoise-50 cursor-pointer py-1.5 text-xs">$100 - $500</SelectItem>
                                        <SelectItem value="500-1000" className="hover:bg-gray-50 focus:bg-turquoise-50 cursor-pointer py-1.5 text-xs">$500 - $1,000</SelectItem>
                                        <SelectItem value="over-1000" className="hover:bg-gray-50 focus:bg-turquoise-50 cursor-pointer py-1.5 text-xs">Over $1,000</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Hours Range Filter */}
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-3">Hours Range</h4>
                                <div className="bg-gray-50 rounded p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-gray-700">{hoursRange[0].toLocaleString()}</span>
                                        <span className="text-xs text-gray-500">to</span>
                                        <span className="text-xs font-medium text-gray-700">{hoursRange[1].toLocaleString()}</span>
                                    </div>
                                    <Slider
                                        value={hoursRange}
                                        onValueChange={setHoursRange}
                                        max={10000}
                                        step={100}
                                        className="w-full [&_[role=slider]]:bg-turquoise-600 [&_[role=slider]]:border-turquoise-600 [&_[role=slider]]:focus:ring-turquoise-500 [&_[role=slider]]:shadow-sm [&_[role=slider]]:w-4 [&_[role=slider]]:h-4"
                                    />
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(selectedTypes.length > 0 || selectedMakes.length > 0 || priceRange !== "all" || buyItNowFilter !== null || rentToOwnFilter !== null) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-3">Active Filters</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTypes.map((type) => (
                                            <Badge key={type} className="bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5" onClick={() => handleTypeChange(type, false)}>
                                                {type}
                                                <X className="h-3 w-3" />
                                            </Badge>
                                        ))}
                                        {selectedMakes.map((make) => (
                                            <Badge key={make} className="bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5" onClick={() => handleMakeChange(make, false)}>
                                                {make}
                                                <X className="h-3 w-3" />
                                            </Badge>
                                        ))}
                                        {priceRange !== "all" && (
                                            <Badge className="bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5" onClick={() => setPriceRange("all")}>
                                                {priceRange.replace(/-/g, ' ').replace(/(\d+)/g, '$$$1')}
                                                <X className="h-3 w-3" />
                                            </Badge>
                                        )}
                                        {buyItNowFilter !== null && (
                                            <Badge className="bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5" onClick={() => setBuyItNowFilter(null)}>
                                                Buy It Now
                                                <X className="h-3 w-3" />
                                            </Badge>
                                        )}
                                        {rentToOwnFilter !== null && (
                                            <Badge className="bg-turquoise-100 text-turquoise-800 hover:bg-turquoise-200 cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5" onClick={() => setRentToOwnFilter(null)}>
                                                Rent to Own
                                                <X className="h-3 w-3" />
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>

                    {/* Machine Grid */}
                    <div className="flex-1">
                        {currentGroupedMachines.length === 0 ? (
                            <NoResults equipmentType={equipmentType} />
                        ) : (
                            <>
                                {/* Machine Grid - Mobile Optimized */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                                    {currentGroupedMachines.map((group) => {
                                        const isBuyItNow = group.machine.buyItNowEnabled && group.machine.buyItNowPrice && group.machine.buyItNowPrice > 0;
                                        return (
                                            <div key={group.machine.id} className="relative">
                                                <MachineCard machine={group.machine} />
                                                {group.quantity > 1 && (
                                                    <div className="absolute top-4 right-4 z-10">
                                                        <Badge className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md">
                                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                                            {group.quantity} Available
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-6 sm:gap-0">
                                        <div className="text-sm text-gray-600 text-center sm:text-left">
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredGroupedMachines.length)} of {filteredGroupedMachines.length} unique models
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>

                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i
                                                    } else {
                                                        pageNum = currentPage - 2 + i
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-sm"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
} 