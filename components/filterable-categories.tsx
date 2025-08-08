"use client";

import { useLocaleHref } from "@/hooks/use-locale-href";
import { getCategoryImage } from "@/lib/category-images";
import { ChevronRight, Wrench } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

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
  equipmentCount?: number;
}

interface FilterableCategoriesProps {
  categories: EquipmentCategory[];
  searchQuery?: string;
}

export default function FilterableCategories({
  categories,
  searchQuery,
}: FilterableCategoriesProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { localeHref } = useLocaleHref();

  // Function to get translated category data
  const getTranslatedCategory = (category: EquipmentCategory) => {
    const translationKey = `equipmentCategories.${category.name}`;
    const hasTranslation = t.has(`${translationKey}.displayName`);

    if (hasTranslation) {
      return {
        ...category,
        displayName: t(`${translationKey}.displayName`),
        description: t(`${translationKey}.description`),
      };
    }

    // Fallback to original data if no translation exists
    return category;
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      return categories;
    }

    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (category) =>
        category.displayName.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  if (filteredCategories.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No categories found for "{searchQuery}"
        </h3>
        <p className="text-gray-600">
          Try searching for different equipment types or browse all categories
          below.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {filteredCategories.map((category) => {
        const translatedCategory = getTranslatedCategory(category);
        return (
          <Link
            key={category._id}
            href={localeHref(`/equipment-rental/${category.name}`)}
            className="group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-colors duration-200 cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative h-28 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {(() => {
                const categoryImage = getCategoryImage(
                  category.name,
                  translatedCategory.displayName
                );
                const imageUrl = category.image?.asset?.url || categoryImage;

                return imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={category.image?.alt || translatedCategory.displayName}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-turquoise-100">
                    <Wrench className="h-16 w-16 text-turquoise-600 opacity-50" />
                  </div>
                );
              })()}

              {/* Subtle divider */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gray-200" />
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors duration-200 line-clamp-1">
                {translatedCategory.displayName}
              </h3>

              {/* View Category Link */}
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-medium text-turquoise-600 group-hover:text-turquoise-700">
                  {t("common.viewAll")}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-turquoise-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 ring-1 ring-transparent group-hover:ring-turquoise-600/40 transition-all duration-200 rounded-lg pointer-events-none" />
          </Link>
        );
      })}
    </div>
  );
}
