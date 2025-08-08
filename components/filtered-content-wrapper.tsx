"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface FilteredContentWrapperProps {
    children: React.ReactNode
    className?: string
}

export default function FilteredContentWrapper({ children, className = "" }: FilteredContentWrapperProps) {
    const searchParams = useSearchParams()
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        // Trigger transition when search params change
        setIsTransitioning(true)

        const timer = setTimeout(() => {
            setIsTransitioning(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchParams])

    return (
        <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-70 transform scale-98' : 'opacity-100 transform scale-100'
            } ${className}`}>
            {children}
        </div>
    )
}
