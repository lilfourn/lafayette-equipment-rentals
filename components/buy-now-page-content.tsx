"use client"

import { useState, useMemo } from "react"
import { type Machine } from "@/components/machine-card"
import SimpleMachineCard from "@/components/simple-machine-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ChevronRight, Filter, Search, ShoppingCart, Truck, Shield, DollarSign, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface BuyNowPageContentProps {
  initialMachines: Machine[]
  error: string | null
}

type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc"

export default function BuyNowPageContent({
  initialMachines,
  error,
}: BuyNowPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>("price-asc")
  const [visibleCount, setVisibleCount] = useState(20)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const t = useTranslations()

  // Extract unique categories from machines
  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialMachines.forEach(machine => {
      if (machine.primaryType) {
        cats.add(machine.primaryType)
      }
    })
    return Array.from(cats).sort()
  }, [initialMachines])

  // Price range definitions
  const priceRanges = [
    { id: "under5k", label: "Under $5,000", min: 0, max: 5000 },
    { id: "5kTo10k", label: "$5,000 - $10,000", min: 5000, max: 10000 },
    { id: "10kTo25k", label: "$10,000 - $25,000", min: 10000, max: 25000 },
    { id: "25kTo50k", label: "$25,000 - $50,000", min: 25000, max: 50000 },
    { id: "over50k", label: "Over $50,000", min: 50000, max: Infinity },
  ]

  // Filter and sort machines
  const filteredMachines = useMemo(() => {
    let filtered = [...initialMachines]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(machine => {
        const name = `${machine.year || ''} ${machine.make} ${machine.model}`.toLowerCase()
        const type = (machine.primaryType || '').toLowerCase()
        return name.includes(query) || type.includes(query)
      })
    }

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(machine => 
        machine.primaryType && selectedCategories.has(machine.primaryType)
      )
    }

    // Price range filter
    if (selectedPriceRanges.size > 0) {
      filtered = filtered.filter(machine => {
        const price = machine.buyItNowPrice || 0
        return Array.from(selectedPriceRanges).some(rangeId => {
          const range = priceRanges.find(r => r.id === rangeId)
          if (!range) return false
          return price >= range.min && price < range.max
        })
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.buyItNowPrice || 0) - (b.buyItNowPrice || 0)
        case "price-desc":
          return (b.buyItNowPrice || 0) - (a.buyItNowPrice || 0)
        case "name-asc":
          const nameA = `${a.year || ''} ${a.make} ${a.model}`.toLowerCase()
          const nameB = `${b.year || ''} ${b.make} ${b.model}`.toLowerCase()
          return nameA.localeCompare(nameB)
        case "name-desc":
          const nameA2 = `${a.year || ''} ${a.make} ${a.model}`.toLowerCase()
          const nameB2 = `${b.year || ''} ${b.make} ${b.model}`.toLowerCase()
          return nameB2.localeCompare(nameA2)
        default:
          return 0
      }
    })

    return filtered
  }, [initialMachines, searchQuery, selectedCategories, selectedPriceRanges, sortBy])

  // Visible machines (for load more functionality)
  const visibleMachines = filteredMachines.slice(0, visibleCount)
  const hasMore = visibleCount < filteredMachines.length

  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(selectedCategories)
    if (newCategories.has(category)) {
      newCategories.delete(category)
    } else {
      newCategories.add(category)
    }
    setSelectedCategories(newCategories)
  }

  const handlePriceRangeToggle = (rangeId: string) => {
    const newRanges = new Set(selectedPriceRanges)
    if (newRanges.has(rangeId)) {
      newRanges.delete(rangeId)
    } else {
      newRanges.add(rangeId)
    }
    setSelectedPriceRanges(newRanges)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories(new Set())
    setSelectedPriceRanges(new Set())
    setSortBy("price-asc")
  }

  const activeFilterCount = selectedCategories.size + selectedPriceRanges.size

  // Filter sidebar content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="font-medium text-gray-900 mb-4">Equipment Type</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <label key={category} className="flex items-center cursor-pointer hover:text-gray-700">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.has(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
                className="border-gray-300 data-[state=checked]:bg-turquoise-600 data-[state=checked]:border-turquoise-600"
              />
              <span className="ml-3 text-sm text-gray-600">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div className="pb-6">
        <h3 className="font-medium text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-3">
          {priceRanges.map(range => {
            const count = initialMachines.filter(m => {
              const price = m.buyItNowPrice || 0
              return price >= range.min && price < range.max
            }).length

            return (
              <label key={range.id} className="flex items-center justify-between cursor-pointer hover:text-gray-700">
                <div className="flex items-center">
                  <Checkbox
                    id={`price-${range.id}`}
                    checked={selectedPriceRanges.has(range.id)}
                    onCheckedChange={() => handlePriceRangeToggle(range.id)}
                    className="border-gray-300 data-[state=checked]:bg-turquoise-600 data-[state=checked]:border-turquoise-600"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    {range.label}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{count}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Equipment
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/equipment-rental">
              <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white">
                View All Equipment
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Cleaner Design */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/equipment-rental" className="hover:text-gray-700 transition-colors">
              Equipment Rental
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Equipment for Sale</span>
          </nav>

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Equipment for Sale
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Browse our complete inventory of quality equipment available for immediate purchase
              </p>
            </div>
            
            {/* Stats Bar */}
            <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{initialMachines.length}</div>
                <div className="text-sm text-gray-600">Available Machines</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-turquoise-600">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">Best Prices</span>
                </div>
                <div className="text-sm text-gray-600">Competitive Rates</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-turquoise-600">
                  <Truck className="h-5 w-5" />
                  <span className="font-semibold">Fast Delivery</span>
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-turquoise-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">Quality</span>
                </div>
                <div className="text-sm text-gray-600">Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Sort Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search equipment..."
                className="w-full pl-10 pr-4 py-2.5 border-gray-200 focus:border-turquoise-500 focus:ring-turquoise-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full lg:w-[200px] border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden border-gray-200">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-turquoise-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-turquoise-600 hover:text-turquoise-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Equipment Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-gray-600">
              Showing {visibleMachines.length} of {filteredMachines.length} results
              {searchQuery && ` for "${searchQuery}"`}
            </div>

            {/* Equipment Grid */}
            {filteredMachines.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <Search className="h-12 w-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No equipment found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleMachines.map((machine) => (
                    <SimpleMachineCard key={machine.id} machine={machine} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => setVisibleCount(prev => prev + 20)}
                      variant="outline"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 px-8"
                    >
                      Load More Equipment
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Need Help Choosing Equipment?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our experts are here to help you find the perfect equipment for your needs and budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-turquoise-600 hover:bg-turquoise-700 text-white font-medium px-8"
              >
                Contact Us
              </Button>
            </Link>
            <a href="tel:+13375452935">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-8"
              >
                Call (337) 545-2935
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}