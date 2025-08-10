export const dynamic = 'force-dynamic';

import type { Machine } from "@/components/machine-card";
import MachineGrid from "@/components/machine-grid";
import {
  LAFAYETTE_LOCATION,
  getMachineCoordinates,
  isWithinLafayetteRadius,
} from "@/lib/location-config";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface EquipmentTypeCityPageProps {
  params: {
    locale: string;
    primaryType: string;
    city: string;
  };
}

// Fetch machines by type and city
async function getMachinesByTypeAndCity(
  primaryType: string,
  city: string
): Promise<Machine[]> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return [];
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  // Decode the URL slugs
  const decodedType = decodeURIComponent(primaryType).replace(/-/g, " ");
  const [cityName, stateCode] = city.split("-");
  const decodedCity = cityName.replace(/-/g, " ");
  const decodedState = stateCode?.toUpperCase() || "LA";

  const filterClauses = [
    "(status eq 'Available' or status eq 'Onboarding')",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
    `primaryType eq '${decodedType}'`,
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

    // For Lafayette, show all machines in radius plus buy-it-now
    // For other cities, we'll show buy-it-now machines as if they're local
    const isLafayette = decodedCity.toLowerCase().includes("lafayette");
    const filteredMachines: Machine[] = [];

    for (const machine of machines) {
      const coords = getMachineCoordinates(machine);

      if (!coords) continue;

      const isInRadius = isWithinLafayetteRadius(coords.lat, coords.lon);

      if (isLafayette) {
        // For Lafayette, show machines actually in Lafayette + buy-it-now
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
      } else {
        // For other cities, only show buy-it-now machines
        if (machine.buyItNowEnabled) {
          filteredMachines.push({
            ...machine,
            buyItNowOnly: true,
            location: {
              ...machine.location,
              city: decodedCity,
              state: decodedState,
            },
          });
        }
      }
    }

    return filteredMachines;
  } catch (error) {
    console.error("Error fetching machines:", error);
    return [];
  }
}

// Format names for display
function formatTypeName(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCityName(city: string): string {
  const [cityName, stateCode] = city.split("-");
  const formattedCity = cityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return `${formattedCity}, ${stateCode?.toUpperCase() || "LA"}`;
}

export async function generateMetadata({
  params,
}: EquipmentTypeCityPageProps): Promise<Metadata> {
  const { primaryType, city } = await params;
  const typeName = formatTypeName(primaryType);
  const cityName = formatCityName(city);

  return {
    title: `${typeName} Rental in ${cityName} | Lafayette Equipment Rentals`,
    description: `Rent ${typeName.toLowerCase()} equipment in ${cityName}. Fast delivery, maintained equipment, and competitive rates. Available for immediate rental.`,
    openGraph: {
      title: `${typeName} Rental in ${cityName}`,
      description: `Professional ${typeName.toLowerCase()} rental services in ${cityName}. 24/7 support, fast delivery, competitive rates.`,
      url: `https://www.lafayetteequipmentrental.com/equipment-rental/type/${primaryType}/${city}`,
      siteName: "Lafayette Equipment Rentals",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `https://www.lafayetteequipmentrental.com/equipment-rental/type/${primaryType}/${city}`,
      languages: {
        "en-US": `/en/equipment-rental/type/${primaryType}/${city}`,
        "es-ES": `/es/equipment-rental/type/${primaryType}/${city}`,
      },
    },
  };
}

export default async function EquipmentTypeCityPage({
  params,
}: EquipmentTypeCityPageProps) {
  const { primaryType, city } = await params;
  const machines = await getMachinesByTypeAndCity(primaryType, city);

  if (machines.length === 0) {
    notFound();
  }

  const typeName = formatTypeName(primaryType);
  const cityName = formatCityName(city);

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
            <a
              href={`/equipment-rental/type/${primaryType}`}
              className="hover:text-white"
            >
              {typeName}
            </a>
            <span>/</span>
            <span className="text-white">{cityName}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {typeName} Rental in {cityName}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            {machines.length} {typeName.toLowerCase()} available for rent in{" "}
            {cityName}. Professional equipment rental services with fast
            delivery and 24/7 support.
          </p>
        </div>
      </section>

      {/* Machine Grid */}
      <MachineGrid
        machines={machines}
        fetchError={null}
        initialSearchQuery=""
        equipmentType={primaryType}
      />
    </div>
  );
}

// Generate static params for common combinations
export async function generateStaticParams() {
  const types = ["excavator", "bulldozer", "loader", "forklift"];
  const cities = [
    "lafayette-la",
    "new-orleans-la",
    "baton-rouge-la",
    "lake-charles-la",
  ];

  const params = [];
  for (const primaryType of types) {
    for (const city of cities) {
      params.push({ primaryType, city });
    }
  }

  return params;
}
