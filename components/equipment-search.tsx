"use client";

import type { Machine } from "@/components/machine-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMachineDetailUrlWithoutLocale } from "@/lib/machine-url-helper";
import { ChevronRight, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
// Sanity removed – strip all industry fetching and related UI

interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
}

interface EquipmentSearchProps {
  categories: EquipmentCategory[];
  onSearchChange?: (query: string) => void;
}

export default function EquipmentSearch({
  categories,
  onSearchChange,
}: EquipmentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Industries removed with Sanity; search now only covers categories
  const [showResults, setShowResults] = useState(false);
  const [machineResults, setMachineResults] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter categories based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { categories: [] };
    }

    const query = searchQuery.toLowerCase().trim();

    const filteredCategories = categories.filter(
      (category) =>
        category.displayName.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
    );

    return { categories: filteredCategories };
  }, [searchQuery, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length > 0);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Could implement navigation to search results page here
    console.log("Search submitted:", searchQuery);
  };

  const hasResults = filteredResults.categories.length > 0;

  // Debounced machine search focused on Lafayette area via API defaults
  useEffect(() => {
    const controller = new AbortController();
    const query = searchQuery.trim();
    if (query.length < 2) {
      setMachineResults([]);
      setFetchError(null);
      setIsLoading(false);
      return () => controller.abort();
    }

    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        // Use centralized nearby endpoint (defaults to 50-mile Lafayette)
        const q = encodeURIComponent(query);
        const res = await fetch(
          `/api/machine/nearby?q=${q}&limit=8&rentalsOnly=true`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!res.ok) {
          setMachineResults([]);
          setFetchError("Search failed");
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setMachineResults(Array.isArray(data.machines) ? data.machines : []);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          setFetchError("Network error");
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search equipment available in Lafayette..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(searchQuery.length > 0)}
            className="pl-12 pr-4 py-4 text-lg border-none focus:ring-0 text-gray-900 bg-transparent"
          />
        </div>
        <Button
          type="submit"
          className="px-8 py-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-none"
        >
          Search
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-2 max-h-96 overflow-y-auto z-50">
          <div className="p-4">
            {/* Lafayette Availability */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Available near Lafayette
                </h3>
                {isLoading && (
                  <span
                    className="flex items-center gap-2 text-xs text-gray-500"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <Loader2
                      className="h-4 w-4 animate-spin text-turquoise-500 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]"
                      aria-hidden="true"
                    />
                    Searching…
                  </span>
                )}
              </div>
              {fetchError && (
                <div className="text-sm text-red-600 mb-2">{fetchError}</div>
              )}
              {machineResults.length > 0 ? (
                <div className="space-y-1">
                  {machineResults.map((machine) => {
                    const name = `${machine.year ? machine.year + " " : ""}${
                      machine.make ?? ""
                    } ${machine.model ?? machine.displayName ?? ""}`.trim();
                    const href = getMachineDetailUrlWithoutLocale(machine);
                    return (
                      <Link
                        key={machine.id}
                        href={href}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                        onClick={() => setShowResults(false)}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-accent transition-colors truncate">
                            {name || machine.displayName || machine.primaryType}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {machine.primaryType}
                            {machine.location?.city
                              ? ` • ${machine.location.city}, ${
                                  machine.location.state ?? ""
                                }`
                              : ""}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-accent transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                !isLoading &&
                searchQuery.trim() && (
                  <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 text-center">
                    <p className="text-sm text-gray-700 mb-3">
                      We don’t currently show this in Lafayette.
                    </p>
                    <Link
                      href={`/contact?need=${encodeURIComponent(
                        searchQuery.trim()
                      )}`}
                    >
                      <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white font-semibold cursor-pointer">
                        Have one within 24 hrs
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Equipment Categories (only show when we have machine results) */}
            {machineResults.length > 0 &&
              filteredResults.categories.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Equipment Categories ({filteredResults.categories.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/equipment-rental/${category.name}`}
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                        onClick={() => setShowResults(false)}
                      >
                        <div className="flex-shrink-0 w-10 h-10 mr-3">
                          {category.image?.asset?.url ? (
                            <Image
                              src={category.image.asset.url}
                              alt={category.image.alt || category.displayName}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                              <span className="text-accent font-semibold text-sm">
                                {category.displayName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-accent transition-colors">
                            {category.displayName}
                          </h4>
                          {category.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-accent transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Backdrop to close search results */}
      {showResults && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
