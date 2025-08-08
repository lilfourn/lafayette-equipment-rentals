"use client";

import { useLocaleHref } from "@/hooks/use-locale-href";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

// Define the featured categories with their specific images
const featuredCategories = [
  // Row 1
  {
    id: "elevated-access",
    name: "elevated-access-machinery",
    displayName: "Elevated Access Machinery",
    description:
      "Explore our wide range of Elevated Access Machinery, perfect for any project in Lafayette, LA.",
    image: "/category images/scissor_lift.png",
    itemCount: 7,
  },
  {
    id: "soil-relocation",
    name: "soil-relocation-machinery",
    displayName: "Soil Relocation Machinery",
    description:
      "Your go-to source for soil relocation machinery in Lafayette, LA. From construction projects to landscaping.",
    image: "/category images/excavator.png",
    itemCount: 17,
  },
  {
    id: "soil-compaction",
    name: "soil-compaction-machinery",
    displayName: "Soil Compaction Machinery",
    description:
      "Our Lafayette, LA-based rental service offers top-quality soil compaction machinery. Ideal for construction.",
    image: "/category images/smooth_drum_roller.png",
    itemCount: 2,
  },
  {
    id: "commercial-trailers",
    name: "commercial-trailers-trucks",
    displayName: "Commercial Trailers & Trucks",
    description:
      "Your trusted source for commercial trailers and trucks in Lafayette, LA. We offer a wide range of vehicles.",
    image: "/category images/dump_truck.png",
    itemCount: 13,
  },
  // Row 2
  {
    id: "masonry-cement",
    name: "masonry-cement-tools",
    displayName: "Masonry & Cement Tools",
    description:
      "Reliable and robust masonry and cement equipment for all your construction needs in Lafayette, LA.",
    image: "/category images/concrete_mixer.png",
    itemCount: 3,
  },
  {
    id: "groundskeeping",
    name: "groundskeeping-forestry-equipment",
    displayName: "Groundskeeping & Forestry Equipment",
    description:
      "For all your groundskeeping and forestry needs in Lafayette, LA, our equipment rental is the perfect solution.",
    image: "/category images/forestry_mulcher.png",
    itemCount: 2,
  },
  {
    id: "energy-illumination",
    name: "energy-illumination-equipment",
    displayName: "Energy and Illumination Equipment",
    description:
      "Providing Lafayette, LA with top-notch energy and illumination equipment. Perfect for professional use.",
    image: "/category images/generator.png",
    itemCount: 5,
  },
  {
    id: "industrial-material",
    name: "industrial-material-management",
    displayName: "Industrial Material Management",
    description:
      "Efficiently manage your project needs with our Industrial Material Management equipment in Lafayette, LA.",
    image: "/category images/forklift.png",
    itemCount: 5,
  },
  // Row 3
  {
    id: "tank-pump",
    name: "tank-pump-rentals",
    displayName: "Tank & Pump Rentals",
    description:
      "Offering a comprehensive range of Tank & Pump Rentals to meet all your project needs in Lafayette, LA.",
    image: "/category images/water_pump.png",
    itemCount: 4,
  },
  {
    id: "excavation-trenchers",
    name: "excavation-trenchers-borers",
    displayName: "Excavation Trenchers & Borers",
    description:
      "For all your excavation projects in Lafayette, LA, rent our high-quality trenchers and borers.",
    image: "/category images/trencher.png",
    itemCount: 2,
  },
  {
    id: "road-safety",
    name: "road-safety-traffic-control",
    displayName: "Road Safety & Traffic Control",
    description:
      "Reliable road safety and traffic control equipment rental in Lafayette, LA. Trusted solutions for your projects.",
    image: "/category images/message_board.png",
    itemCount: 2,
  },
  {
    id: "storage-units",
    name: "storage-units-container-solutions",
    displayName: "Storage Units & Container Solutions",
    description:
      "Discover top-quality storage units and container solutions in Lafayette, LA. Our inventory caters to all needs.",
    image: "/category images/storage_container.png",
    itemCount: 2,
  },
  // Row 4
  {
    id: "screening-pulverizing",
    name: "screening-pulverizing-gear",
    displayName: "Screening & Pulverizing Gear",
    description:
      "Our Screening & Pulverizing Gear category offers high-end, reliable equipment for all your processing needs.",
    image: "/category images/screener.png",
    itemCount: 4,
  },
  {
    id: "advanced-earthmoving",
    name: "advanced-earthmoving-machinery",
    displayName: "Advanced Earthmoving Machinery",
    description:
      "Offering a wide range of advanced earthmoving machinery suitable for various excavation projects.",
    image: "/category images/motor_grader.png",
    itemCount: 4,
  },
  {
    id: "road-surface",
    name: "road-surface-solutions",
    displayName: "Road Surface Solutions",
    description:
      "Explore our Road Surface Solutions category for all your asphalt and paving needs in Lafayette, LA.",
    image: "/category images/paver.png",
    itemCount: 5,
  },
  {
    id: "land-tree-clearing",
    name: "land-tree-clearing-gear",
    displayName: "Land and Tree Clearing Gear",
    description:
      "Quality equipment for land and tree clearing tasks in Lafayette, LA. Reliable, efficient, and powerful.",
    image: "/category images/track_loader.png",
    itemCount: 6,
  },
];

export default function FeaturedCategories() {
  const t = useTranslations();
  const { localeHref } = useLocaleHref();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {featuredCategories.map((category) => (
        <Link
          key={category.id}
          href={localeHref(`/equipment-rental/${category.name}`)}
          className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Image Container */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <Image
              src={category.image}
              alt={category.displayName}
              fill
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-turquoise-600 transition-colors duration-200 mb-2">
              {category.displayName}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {category.description}
            </p>

            {/* View Category Link */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-turquoise-600 group-hover:text-turquoise-700">
                {t("common.viewAll")}
              </span>
              <ChevronRight className="h-4 w-4 text-turquoise-600 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Equipment Count Badge */}
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {category.itemCount}+ {t("equipment.itemsAvailable")}
            </div>
          </div>

          {/* Hover Border Effect */}
          <div className="absolute inset-0 border-2 border-turquoise-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
        </Link>
      ))}
    </div>
  );
}
