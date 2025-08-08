"use client";

import { Badge } from "@/components/ui/badge";
import {
  MegaMenu,
  MegaMenuContent,
  MegaMenuTrigger,
} from "@/components/ui/mega-menu";
import { useLocaleHref } from "@/hooks/use-locale-href";
import { type Equipment, type EquipmentCategory } from "@/lib/server-data";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EquipmentCategoriesDropdownProps {
  categories: EquipmentCategory[];
  equipment: Equipment[];
}

export default function EquipmentCategoriesDropdown({
  categories,
  equipment,
}: EquipmentCategoriesDropdownProps) {
  const { localeHref } = useLocaleHref();
  const t = useTranslations();
  const [equipmentPopularity, setEquipmentPopularity] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Function to fetch equipment popularity from our API route
  const fetchEquipmentPopularity = async (): Promise<
    Record<string, number>
  > => {
    try {
      const response = await fetch("/api/equipment-popularity");

      if (!response.ok) {
        console.error(
          "Equipment popularity API request failed:",
          response.status
        );
        return {};
      }

      const popularityMap = await response.json();
      return popularityMap;
    } catch (error) {
      console.error("Error fetching equipment popularity:", error);
      return {};
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const popularityData = await fetchEquipmentPopularity();
        setEquipmentPopularity(popularityData);
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEquipmentByCategory = (categoryName: string) => {
    // Filter equipment by category
    const filteredEquipment = equipment.filter(
      (item) => item.category?.name === categoryName
    );

    // Sort by popularity (descending), then by featured status, then by title alphabetically
    return filteredEquipment.sort((a, b) => {
      // First by popularity (calculated from title)
      const aPopularity = getEquipmentPopularity(a.title);
      const bPopularity = getEquipmentPopularity(b.title);
      if (aPopularity !== bPopularity) {
        return bPopularity - aPopularity;
      }

      // Then by featured status
      if (a.featured !== b.featured) {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }

      // Finally by title alphabetically
      return a.title.localeCompare(b.title);
    });
  };

  // Helper function to get equipment popularity score
  const getEquipmentPopularity = (equipmentTitle: string): number => {
    const title = equipmentTitle.toLowerCase();

    // Try exact match first
    if (equipmentPopularity[title]) {
      return equipmentPopularity[title];
    }

    // Try common variations and mappings
    const variations = [
      title.replace(/\s+/g, "-"),
      title.replace(/\s+/g, ""),
      title.replace(/-/g, " "),
      title.replace(/\s+/g, "_"),
    ];

    for (const variation of variations) {
      if (equipmentPopularity[variation]) {
        return equipmentPopularity[variation];
      }
    }

    // Try partial matches for compound equipment names
    const popularityKeys = Object.keys(equipmentPopularity);
    for (const key of popularityKeys) {
      if (title.includes(key) || key.includes(title)) {
        return equipmentPopularity[key];
      }
    }

    return 0; // Default if no match found
  };

  // Get count of equipment per category
  const getCategoryCount = (categoryName: string) => {
    return equipment.filter((item) => item.category?.name === categoryName)
      .length;
  };

  // Get top 3 popular equipment across all categories
  const getPopularEquipment = () => {
    return equipment
      .map((item) => ({
        ...item,
        popularity: getEquipmentPopularity(item.title),
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4);
  };

  const popularEquipment = getPopularEquipment();

  return (
    <MegaMenu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <MegaMenuTrigger className="text-gray-700 hover:text-turquoise-600 px-3 py-2 text-base font-medium transition-all duration-200">
          {t("navigation.equipmentAndTools")}{" "}
          <ChevronDown className="ml-1 h-4 w-4" />
        </MegaMenuTrigger>
      }
    >
      <MegaMenuContent className="w-screen max-w-7xl p-0">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t("navigation.equipmentAndTools")}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Browse our extensive collection of rental equipment
              </p>
            </div>
            <Link
              href={localeHref("/equipment-rental")}
              className="group flex items-center gap-2 rounded-full bg-turquoise-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-turquoise-700 hover:shadow-lg"
              onClick={() => setIsOpen(false)}
            >
              {t("navigation.viewAllEquipment")}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Popular Equipment */}
          {!loading && popularEquipment.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  {t("navigation.popular")} Equipment
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularEquipment.map((item) => (
                  <Link
                    key={item._id}
                    href={localeHref(
                      `/equipment-rental/${item.category?.name}/${item.slug?.current}`
                    )}
                    className="group"
                    onClick={() => setIsOpen(false)}
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer bg-gray-100 text-gray-700 transition-all hover:bg-turquoise-100 hover:text-turquoise-700"
                    >
                      {item.title}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const count = getCategoryCount(category.name);
              const categoryEquipment = getEquipmentByCategory(
                category.name
              ).slice(0, 3);

              return (
                <Link
                  key={category._id}
                  href={localeHref(`/equipment-rental/${category.name}`)}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-turquoise-200 hover:shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {/* Category Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 group-hover:text-turquoise-600 transition-colors">
                        {category.displayName}
                      </h5>
                      <p className="mt-1 text-xs text-gray-500">
                        {count} items
                      </p>
                    </div>
                    {category.image?.asset?.url && (
                      <div className="ml-3 h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={category.image.asset.url}
                          alt={category.image.alt || category.displayName}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Equipment Preview */}
                  {categoryEquipment.length > 0 && (
                    <div className="space-y-1">
                      {categoryEquipment.map((item, index) => (
                        <p
                          key={item._id || index}
                          className="text-xs text-gray-600 truncate"
                        >
                          {item.title}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute bottom-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4 text-turquoise-600" />
                  </div>

                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-turquoise-50/0 to-turquoise-100/0 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>
      </MegaMenuContent>
    </MegaMenu>
  );
}
