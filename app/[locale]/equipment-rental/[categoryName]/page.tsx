import { notFound, redirect } from "next/navigation";
import React from "react";
// Sanity removed
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Equipment {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  keyFeatures?: string[];
  iconImage?: { asset?: { url?: string } };
  heroImage?: { asset?: { url?: string } };
  iconAlt?: string;
  heroAlt?: string;
}

interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  heroImage?: { asset?: { url?: string }; alt?: string };
  image?: { asset?: { url?: string }; alt?: string };
  equipment: Equipment[];
}

export async function generateStaticParams() {
  const regularParams: Array<{ categoryName: string }> = [];

  // Add SEO-friendly category routes
  const seoCategories = [
    "excavator-rental-lafayette-la",
    "bulldozer-rental-lafayette-la",
    "skid-steer-rental-lafayette-la",
    "backhoe-rental-lafayette-la",
    "forklift-rental-lafayette-la",
    "scissor-lift-rental-lafayette-la",
    "boom-lift-rental-lafayette-la",
    "generator-rental-lafayette-la",
    "compressor-rental-lafayette-la",
    "loader-rental-lafayette-la",
  ];
  const seoParams = seoCategories.map((slug) => ({ categoryName: slug }));

  return [...regularParams, ...seoParams];
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { categoryName: string };
}) {
  const { categoryName } = params;

  // Check if this is a long-tail SEO route
  if (categoryName.includes("-rental-")) {
    // Parse the type and location from the slug
    // Format: excavator-rental-lafayette-la
    const parts = categoryName.split("-rental-");
    const equipmentType = parts[0]?.replace(/-/g, " ");
    const locationParts = parts[1]?.split("-") || [];
    const city = locationParts[0];
    const state = locationParts[1]?.toUpperCase();

    const formattedType = equipmentType
      ?.split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const formattedCity = city
      ?.split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const location = `${formattedCity || "Lafayette"}, ${state || "LA"}`;

    return {
      title: `${
        formattedType || "Equipment"
      } Rental ${location} | Heavy Equipment Rentals`,
      description: `Find the best ${
        formattedType?.toLowerCase() || "equipment"
      } rentals in ${location}. Wide selection available with daily, weekly, and monthly rates. Same-day delivery available.`,
      keywords: [
        `${equipmentType} rental ${location}`,
        `${equipmentType} rental`,
        `rent ${equipmentType} ${city}`,
        "heavy equipment rental",
        location,
      ],
    };
  }

  // Regular category metadata
  const category = await getCategory(categoryName);
  if (!category) {
    return {
      title: "Equipment Category Not Found",
      description: "The requested equipment category could not be found.",
    };
  }

  return {
    title: `${category.displayName} Equipment Rentals | Lafayette Equipment Rentals`,
    description:
      category.description ||
      `Browse our selection of ${category.displayName.toLowerCase()} equipment available for rent. Competitive rates and reliable equipment.`,
    keywords: [
      `${category.displayName} rental`,
      `${category.displayName} equipment`,
      "equipment rental",
      "Lafayette equipment rental",
    ],
  };
}

async function getCategory(
  categoryName: string
): Promise<EquipmentCategory | null> {
  return {
    _id: categoryName,
    name: categoryName,
    displayName: categoryName
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()),
    description: undefined,
    equipment: [],
  };
}

export default async function EquipmentCategoryPage({
  params,
}: {
  params: { categoryName: string; locale: string };
}) {
  const { categoryName, locale } = params;

  // Check if this is a long-tail SEO route (contains "-rental-")
  if (categoryName.includes("-rental-")) {
    // This is an SEO route like "excavator-rental-lafayette-la"
    // For now, redirect to the main equipment rental page
    // In the future, this could show filtered results for that equipment type
    redirect(`/${locale}/equipment-rental`);
  }

  // Regular category handling
  const category = await getCategory(categoryName);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            HOMEPAGE
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/equipment-rental" className="hover:text-blue-600">
            EQUIPMENT AND TOOLS
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">
            {category.displayName.toUpperCase()}
          </span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {category.displayName} Equipment Rentals
          </h1>
          {category.description && (
            <p className="text-gray-700 text-lg">{category.description}</p>
          )}
        </div>

        {/* Equipment Grid */}
        {category.equipment && category.equipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.equipment.map((equipment) => (
              <Link
                key={equipment._id}
                href={`/equipment-rental/${category.name}/${equipment.slug}`}
                className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="mb-4 h-48 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                  <Image
                    src={
                      equipment.iconImage?.asset?.url ??
                      equipment.heroImage?.asset?.url ??
                      "/placeholder.svg"
                    }
                    alt={
                      equipment.iconAlt || equipment.heroAlt || equipment.title
                    }
                    width={200}
                    height={150}
                    className="object-contain h-40 w-auto"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600">
                  {equipment.title}
                </h2>
                {equipment.shortDescription && (
                  <p className="text-gray-700 mb-4">
                    {equipment.shortDescription}
                  </p>
                )}
                {equipment.keyFeatures && equipment.keyFeatures.length > 0 && (
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    {equipment.keyFeatures.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto">
                  <span className="inline-block text-blue-600 font-medium group-hover:underline">
                    View Details & Pricing
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No equipment available in this category at the moment.
            </p>
            <Button asChild className="mt-4 bg-accent hover:bg-accent-dark">
              <Link href="/equipment-rental">Browse All Equipment</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
