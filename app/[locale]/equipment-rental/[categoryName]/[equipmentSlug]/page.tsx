import EquipmentLayoutWrapper from "@/components/equipment-layout-wrapper";
import { type Machine } from "@/components/machine-card";
import { LAFAYETTE_LOCATION } from "@/lib/location-config";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React from "react";

// Sanity removed; use static fallback for equipment header

interface SearchResults {
  machines: Machine[];
  error: string | null;
}

// Using shared generateFacets utility function from lib/generate-facets.ts

async function getMachinesForEquipment(
  equipmentTitle: string
): Promise<SearchResults> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return { machines: [], error: "Service not configured" };
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  const lafayetteLat = LAFAYETTE_LOCATION.latitude;
  const lafayetteLon = LAFAYETTE_LOCATION.longitude;
  const radiusInKm = LAFAYETTE_LOCATION.serviceRadiusMiles * 1.60934;

  const getEquipmentFilter = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("air compressor")) {
      return "(primaryType eq 'Air Compressor' or primaryType eq 'air-compressor' or primaryType eq 'Air-Compressor')";
    }
    if (lowerTitle.includes("skid steer")) {
      return "(primaryType eq 'Skid Steer' or primaryType eq 'skid-steer' or primaryType eq 'Skid-Steer')";
    }
    if (lowerTitle.includes("excavator")) {
      return "(primaryType eq 'Excavator' or primaryType eq 'excavator')";
    }
    if (lowerTitle.includes("forklift")) {
      return "(primaryType eq 'Forklift' or primaryType eq 'forklift')";
    }
    return `(primaryType eq '${title}' or primaryType eq '${title.toLowerCase()}' or primaryType eq '${title
      .replace(/\s+/g, "-")
      .toLowerCase()}')`;
  };

  const filterClauses = [
    `(geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') le ${radiusInKm})`,
    "(status eq 'Available' or status eq 'Onboarding')",
    "(rentalRate ne 0)",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
    getEquipmentFilter(equipmentTitle),
  ];

  const requestBody = {
    count: true,
    filter: filterClauses.join(" and "),
    search: "",
    searchMode: "all",
    top: 50,
    orderby: `geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') asc`,
    facets: ["make,count:20", "model,count:20"],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      next: {
        revalidate: 900, // Revalidate every 15 minutes for machine data
        tags: ["machines"],
      },
    });

    if (!response.ok) {
      console.error("Rubbl API request failed:", response.status);
      return { machines: [], error: null };
    }

    const data = await response.json();
    return {
      machines: data.value || [],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching machines from Rubbl API:", error);
    return { machines: [], error: null };
  }
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: { categoryName: string; equipmentSlug: string; locale: string };
}) {
  const { categoryName, equipmentSlug, locale } = params;

  // Check if this is a long-tail SEO route with a machine ID
  if (categoryName.includes("-rental-")) {
    // This is an SEO route like "excavator-rental-lafayette-la" with a machine ID
    // The equipmentSlug is actually the machine ID
    // Redirect to the canonical machine page
    redirect(`/${locale}/equipment-rental/machines/${equipmentSlug}`);
  }

  // Regular equipment detail handling
  const equipment = {
    title: equipmentSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()),
    category: {
      displayName: categoryName
        .replace(/-/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase()),
    },
  } as any;

  const { machines } = await getMachinesForEquipment(equipment.title);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
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
          <Link
            href={`/equipment-rental/${categoryName}`}
            className="hover:text-blue-600"
          >
            {equipment.category?.displayName?.toUpperCase() ||
              categoryName.toUpperCase()}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">
            {equipment.title.toUpperCase()}
          </span>
        </nav>

        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Industrial and Commercial {equipment.title} Rentals
          </h1>
          <p className="text-gray-600 max-w-4xl">
            Find reliable {equipment.title.toLowerCase()} for your projects with
            our extensive leasing options. Suitable for both portable and
            stationary applications that require high performance and
            durability.
          </p>
        </div>

        {/* Responsive Layout with Filters and Machine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <EquipmentLayoutWrapper
            machines={machines}
            equipmentType={equipment.title}
          />
        </div>
      </div>
    </div>
  );
}
