import type { Machine } from "@/components/machine-card";
import MachineGridSkeleton from "@/components/skeletons/machine-grid-skeleton";
import {
  LAFAYETTE_LOCATION,
  getMachineCoordinates,
  isWithinLafayetteRadius,
} from "@/lib/location-config";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Lazy load MachineGrid
const MachineGrid = dynamic(() => import("@/components/machine-grid"), {
  loading: () => <MachineGridSkeleton showFilters={true} />,
  ssr: true,
});

interface EquipmentTypePageProps {
  params: {
    locale: string;
    primaryType: string;
  };
}

// Fetch machines by type
async function getMachinesByType(primaryType: string): Promise<Machine[]> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return [];
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  // Decode the URL slug back to proper type name
  const decodedType = decodeURIComponent(primaryType).replace(/-/g, " ");

  const filterClauses = [
    "(status eq 'Available' or status eq 'Onboarding')",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
    `primaryType eq '${decodedType}'`, // Filter by equipment type
  ];

  const requestBody = {
    count: true,
    filter: filterClauses.join(" and "),
    search: "",
    searchMode: "all",
    top: 1000,
    select: "*",
    facets: [],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("API request failed:", response.status);
      return [];
    }

    const data = await response.json();
    const machines = data.value || [];

    // Filter for Lafayette area and buy-it-now machines
    const filteredMachines: Machine[] = [];

    for (const machine of machines) {
      const coords = getMachineCoordinates(machine);

      if (!coords) continue;

      const isInRadius = isWithinLafayetteRadius(coords.lat, coords.lon);

      if (isInRadius || machine.buyItNowEnabled) {
        filteredMachines.push({
          ...machine,
          ...(!isInRadius && machine.buyItNowEnabled
            ? {
                buyItNowOnly: true,
                location: {
                  ...machine.location,
                  city: LAFAYETTE_LOCATION.city,
                  state: LAFAYETTE_LOCATION.state,
                },
              }
            : {}),
        });
      }
    }

    return filteredMachines;
  } catch (error) {
    console.error("Error fetching machines by type:", error);
    return [];
  }
}

// Format type name for display
function formatTypeName(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: EquipmentTypePageProps): Promise<Metadata> {
  const { primaryType } = await params;
  const typeName = formatTypeName(primaryType);

  return {
    title: `${typeName} Rental in Lafayette, LA | Lafayette Equipment Rentals`,
    description: `Rent ${typeName.toLowerCase()} equipment in Lafayette, Louisiana. Wide selection of ${typeName.toLowerCase()} available for immediate rental with competitive rates and 24/7 support.`,
    openGraph: {
      title: `${typeName} Rental in Lafayette, LA`,
      description: `Professional ${typeName.toLowerCase()} rental services in Lafayette and surrounding areas. Fast delivery, maintained equipment, competitive rates.`,
      url: `https://www.lafayetteequipmentrental.com/equipment-rental/type/${primaryType}`,
      siteName: "Lafayette Equipment Rentals",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `https://www.lafayetteequipmentrental.com/equipment-rental/type/${primaryType}`,
      languages: {
        "en-US": `/en/equipment-rental/type/${primaryType}`,
        "es-ES": `/es/equipment-rental/type/${primaryType}`,
      },
    },
  };
}

export default async function EquipmentTypePage({
  params,
}: EquipmentTypePageProps) {
  const { primaryType } = await params;
  const machines = await getMachinesByType(primaryType);

  if (machines.length === 0) {
    notFound();
  }

  const typeName = formatTypeName(primaryType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm mb-4 text-white/80">
            <a href="/" className="hover:text-white">
              Home
            </a>
            <span>/</span>
            <a href="/equipment-rental" className="hover:text-white">
              Equipment Rental
            </a>
            <span>/</span>
            <span className="text-white">{typeName}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {typeName} Rental in Lafayette, LA
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Browse our selection of {machines.length} {typeName.toLowerCase()}{" "}
            available for rent. Fast delivery, competitive rates, and 24/7
            support throughout Lafayette and the Acadiana region.
          </p>
        </div>
      </section>

      {/* Machine Grid */}
      <Suspense fallback={<MachineGridSkeleton showFilters={true} />}>
        <MachineGrid
          machines={machines}
          fetchError={null}
          initialSearchQuery=""
          equipmentType={primaryType}
        />
      </Suspense>
    </div>
  );
}

// Generate static params for known equipment types
export async function generateStaticParams() {
  // Common equipment types - will be dynamically expanded based on actual data
  const types = [
    "excavator",
    "bulldozer",
    "loader",
    "backhoe",
    "forklift",
    "scissor-lift",
    "boom-lift",
    "compactor",
    "generator",
    "pump",
    "trailer",
    "truck",
  ];

  return types.map((type) => ({
    primaryType: type,
  }));
}
