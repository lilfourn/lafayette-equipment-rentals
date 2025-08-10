"use client";

import type { Machine } from "@/components/machine-card";
import { getCategoryImage } from "@/lib/category-images";
import { mapLabelsToInternal } from "@/lib/industry-config";
import { IndustryBrowseSkeleton } from "@/components/skeletons/industry-card-skeleton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface IndustryBrowseItem {
  industry: { name: string; slug: string };
  machines: Machine[];
  availableCount: number;
}

interface IndustryBrowseProps {
  items: IndustryBrowseItem[];
  isLoading?: boolean;
}

export default function IndustryBrowse({ items, isLoading: initialLoading = false }: IndustryBrowseProps) {
  const router = useRouter();
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  
  // Handle loading state
  useEffect(() => {
    if (!items || items.length === 0) {
      setIsLoading(true);
      // Simulate loading for better UX if no items
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [items]);
  
  const sortedItems = [...items].sort(
    (a, b) => b.availableCount - a.availableCount
  );
  
  // Show skeleton while loading
  if (isLoading) {
    return <IndustryBrowseSkeleton />;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {sortedItems.map((it) => {
        const mappings = mapLabelsToInternal(
          (it as any).industry.equipmentLabels || []
        );
        // Pick the first image that exists, otherwise choose a deterministic fallback per slug
        let imageSrc: string | null = null;
        for (const m of mappings) {
          imageSrc = getCategoryImage(m.categorySlug, m.primaryType);
          if (imageSrc) break;
        }
        if (!imageSrc) {
          const FALLBACKS = [
            "/category images/excavator.png",
            "/category images/skid_steer.png",
            "/category images/telehandler.png",
            "/category images/forklift.png",
            "/category images/wheel_loader.png",
            "/category images/light_tower.png",
            "/category images/generator.png",
            "/category images/trencher.png",
          ];
          const slug = it.industry.slug || "industry";
          const hash = Array.from(slug).reduce(
            (acc, ch) => acc + ch.charCodeAt(0),
            0
          );
          imageSrc = FALLBACKS[hash % FALLBACKS.length];
        }

        const href =
          it.availableCount > 0
            ? `/industries/${it.industry.slug}`
            : `/industries/${it.industry.slug}/unavailable`;

        // Build brief SEO-friendly description from equipment labels or machine types
        const labels: string[] = ((it as any).industry.equipmentLabels ||
          []) as string[];
        const labelKeywords = labels.slice(0, 3).join(", ");
        const fallbackKeywords = Array.from(
          new Set((it.machines || []).map((m) => m.primaryType))
        )
          .filter(Boolean)
          .slice(0, 3)
          .join(", ");
        const keywords = labelKeywords || fallbackKeywords;
        const description = keywords
          ? `${it.industry.name} rentals: ${keywords} in Lafayette, LA.`
          : `${it.industry.name} equipment rentals in Lafayette, LA.`;

        return (
          <button
            key={it.industry.slug}
            onClick={() => {
              setNavigatingSlug(it.industry.slug);
              router.push(href);
            }}
            aria-busy={navigatingSlug === it.industry.slug}
            className="group relative text-left bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300 hover:ring-1 hover:ring-gray-200 transition-all cursor-pointer w-full disabled:opacity-60"
            disabled={navigatingSlug === it.industry.slug}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-bold text-gray-900">
                {it.industry.name}
              </h3>
            </div>

            <div className="relative h-40 sm:h-56 bg-white">
              <Image
                src={imageSrc}
                alt={`${it.industry.name}`}
                fill
                className="object-contain p-6"
              />
              {navigatingSlug === it.industry.slug && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                  <svg
                    className="animate-spin h-6 w-6 text-turquoise-600"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                </div>
              )}
              {typeof it.availableCount === "number" && (
                <div
                  className={`${
                    it.availableCount > 0
                      ? "bg-turquoise-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  } absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm`}
                  aria-label={`${it.availableCount} ${
                    it.availableCount === 1
                      ? "machine available"
                      : "machines available"
                  }`}
                >
                  {it.availableCount}{" "}
                  {it.availableCount === 1 ? "Available" : "Available"}
                </div>
              )}
            </div>

            <div className="p-4">
              <p
                className="text-sm text-gray-600 line-clamp-2"
                aria-label={`${it.industry.name} description`}
              >
                {description}
              </p>
              {it.availableCount === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  No machines available today — tap to request sourcing within
                  24 hours.
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
