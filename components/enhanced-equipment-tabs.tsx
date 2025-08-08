"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Equipment {
  _id: string;
  title: string;
  slug: { current: string };
  shortDescription?: string;
  keyFeatures?: string[];
  iconImage?: { asset?: { url?: string } };
  heroImage?: { asset?: { url?: string } };
  featured?: boolean;
}

interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  image?: { asset?: { url?: string }; alt?: string };
  equipment?: Equipment[];
}

interface EquipmentTab {
  _key: string;
  tabName: string;
  tabValue: string;
  shortDescription?: string;
  equipmentCategories?: EquipmentCategory[];
}

interface EnhancedEquipmentTabsProps {
  equipmentTabs: EquipmentTab[];
}

export default function EnhancedEquipmentTabs({
  equipmentTabs,
}: EnhancedEquipmentTabsProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Tabs defaultValue={equipmentTabs[0]?.tabValue} className="w-full">
        {/* Responsive tabs container */}
        <div className="mb-8">
          <div className="flex justify-center">
            <TabsList className="bg-gray-800 border border-gray-700 p-1 rounded-lg inline-flex">
              {/* Mobile: Stacked layout */}
              <div className="grid grid-cols-1 sm:hidden w-full gap-1">
                {equipmentTabs.map((tab) => (
                  <TabsTrigger
                    key={tab._key}
                    value={tab.tabValue}
                    className="w-full py-3 px-4 text-sm font-medium text-gray-300 hover:text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md transition-all text-center"
                  >
                    <span className="whitespace-nowrap">{tab.tabName}</span>
                  </TabsTrigger>
                ))}
              </div>

              {/* Tablet: Flexible grid */}
              <div
                className="hidden sm:grid md:hidden w-full gap-1"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    equipmentTabs.length,
                    2
                  )}, 1fr)`,
                }}
              >
                {equipmentTabs.map((tab) => (
                  <TabsTrigger
                    key={tab._key}
                    value={tab.tabValue}
                    className="py-3 px-3 text-xs font-medium text-gray-300 hover:text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md transition-all text-center"
                  >
                    <span className="whitespace-nowrap block">
                      {tab.tabName}
                    </span>
                  </TabsTrigger>
                ))}
              </div>

              {/* Desktop: Centered flex layout */}
              <div className="hidden md:flex gap-1 justify-center flex-wrap">
                {equipmentTabs.map((tab) => (
                  <TabsTrigger
                    key={tab._key}
                    value={tab.tabValue}
                    className="py-3 px-4 text-sm font-medium text-gray-300 hover:text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md transition-all text-center whitespace-nowrap"
                  >
                    {tab.tabName}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </div>
        </div>

        {equipmentTabs.map((tab) => (
          <TabsContent key={tab._key} value={tab.tabValue} className="mt-8">
            <div className="text-center mb-8">
              <p className="text-gray-300 text-lg font-medium leading-relaxed max-w-4xl mx-auto">
                {tab.shortDescription ||
                  `Discover top-tier ${tab.tabName} for your projects in Lafayette, LA. Enhance efficiency with our premium rental services.`}
              </p>
            </div>

            {/* All equipment from all categories - centered layout */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl">
                {tab.equipmentCategories?.map((category) =>
                  category.equipment?.map((equipment) => (
                    <EquipmentCard
                      key={equipment._id}
                      equipment={equipment}
                      categorySlug={category.name}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface EquipmentCardProps {
  equipment: Equipment;
  categorySlug: string;
}

function EquipmentCard({ equipment, categorySlug }: EquipmentCardProps) {
  const imageUrl =
    equipment.iconImage?.asset?.url ?? equipment.heroImage?.asset?.url;

  return (
    <Link href={`/equipment-rental/${categorySlug}/${equipment.slug.current}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-500/50 transition-all duration-300 cursor-pointer group h-full max-w-sm mx-auto">
        <div className="flex flex-col h-full">
          {/* Equipment Image */}
          <div className="relative w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={equipment.title}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            )}
          </div>

          {/* Equipment Title */}
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-center">
                {equipment.title}
              </h3>
              {equipment.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
              )}
            </div>
            {equipment.shortDescription && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {equipment.shortDescription}
              </p>
            )}
          </div>

          {/* View Details Button */}
          <div className="mt-auto">
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
              <span className="font-medium text-sm">View Details</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
