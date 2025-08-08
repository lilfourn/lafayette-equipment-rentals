'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Zap, ShoppingCart } from 'lucide-react'

interface HeroSearchProps {
    onSearch: (query: string, filter: 'all' | 'rentals' | 'buyitnow') => void
}

export default function HeroSearch({ onSearch }: HeroSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'rentals' | 'buyitnow'>('all')

    const handleSearch = () => {
        onSearch(searchQuery.trim(), activeFilter)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleFilterChange = (filter: 'all' | 'rentals' | 'buyitnow') => {
        setActiveFilter(filter)
        // Trigger search immediately when filter changes
        onSearch(searchQuery.trim(), filter)
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white/98 backdrop-blur-sm rounded-2xl p-2 shadow-elevated border border-white/20">
                    <div className="flex">
                        <Input
                            type="text"
                            placeholder="Search by equipment type, make, or model (e.g., Caterpillar excavator, Bobcat skid steer...)"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                            className="flex-1 h-14 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                            onClick={handleSearch}
                            className="h-14 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-soft hover:shadow-elevated transition-all"
                        >
                            <Search className="h-5 w-5 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => handleFilterChange('all')}
                    className={`h-12 px-6 font-medium transition-all duration-200 border-2 ${activeFilter === 'all'
                            ? 'bg-white text-primary border-white shadow-soft hover:shadow-elevated'
                            : 'bg-primary/10 text-white border-primary/30 hover:bg-primary/20 hover:border-primary/50 backdrop-blur-sm'
                        }`}
                >
                    <Zap className="h-4 w-4 mr-2" />
                    All Equipment
                </Button>
                <Button
                    variant={activeFilter === 'rentals' ? 'default' : 'outline'}
                    onClick={() => handleFilterChange('rentals')}
                    className={`h-12 px-6 font-medium transition-all duration-200 border-2 ${activeFilter === 'rentals'
                            ? 'bg-white text-primary border-white shadow-soft hover:shadow-elevated'
                            : 'bg-primary/10 text-white border-primary/30 hover:bg-primary/20 hover:border-primary/50 backdrop-blur-sm'
                        }`}
                >
                    Rentals Only
                </Button>
                <Button
                    variant={activeFilter === 'buyitnow' ? 'default' : 'outline'}
                    onClick={() => handleFilterChange('buyitnow')}
                    className={`h-12 px-6 font-medium transition-all duration-200 border-2 ${activeFilter === 'buyitnow'
                            ? 'bg-white text-primary border-white shadow-soft hover:shadow-elevated'
                            : 'bg-primary/10 text-white border-primary/30 hover:bg-primary/20 hover:border-primary/50 backdrop-blur-sm'
                        }`}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy It Now
                </Button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
                <span className="text-white/80 text-sm font-medium">Popular:</span>
                {['Excavator', 'Skid Steer', 'Generator', 'Forklift'].map((suggestion) => (
                    <button
                        key={suggestion}
                        onClick={() => {
                            setSearchQuery(suggestion)
                            onSearch(suggestion, activeFilter)
                        }}
                        className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-white rounded-full transition-colors backdrop-blur-sm border border-primary/30 hover:border-primary/50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    )
} 