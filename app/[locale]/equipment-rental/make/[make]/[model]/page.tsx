export const dynamic = 'force-dynamic';

import type { Machine } from "@/components/machine-card";
import MachineGridSkeleton from "@/components/skeletons/machine-grid-skeleton";
import {
  LAFAYETTE_LOCATION,
  getMachineCoordinates,
  isWithinLafayetteRadius,
} from "@/lib/location-config";
import { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Lazy load MachineGrid
const MachineGrid = dynamicImport(() => import("@/components/machine-grid"), {
  loading: () => <MachineGridSkeleton showFilters={true} />,
  ssr: true,
});

interface MakeModelPageProps {
  params: {
    locale: string;
    make: string;
    model: string;
  };
}

// Fetch machines by make and model
async function getMachinesByMakeModel(
  make: string,
  model: string
): Promise<Machine[]> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return [];
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  // Decode the URL slugs back to proper names
  const decodedMake = decodeURIComponent(make).replace(/-/g, " ");
  const decodedModel = decodeURIComponent(model).replace(/-/g, " ");

  const filterClauses = [
    "(status eq 'Available' or status eq 'Onboarding')",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
    `make eq '${decodedMake}'`,
    `model eq '${decodedModel}'`,
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
    console.error("Error fetching machines by make/model:", error);
    return [];
  }
}

// Format names for display
function formatName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: MakeModelPageProps): Promise<Metadata> {
  const { make, model } = await params;
  const makeName = formatName(make);
  const modelName = formatName(model);

  return {
    title: `${makeName} ${modelName} Rental in Lafayette, LA | Lafayette Equipment Rentals`,
    description: `Rent ${makeName} ${modelName} equipment in Lafayette, Louisiana. Professional equipment rental services with competitive rates and 24/7 support.`,
    openGraph: {
      title: `${makeName} ${modelName} Rental in Lafayette, LA`,
      description: `Professional ${makeName} ${modelName} rental services in Lafayette and surrounding areas. Fast delivery, maintained equipment, competitive rates.`,
      url: `https://www.lafayetteequipmentrental.com/equipment-rental/make/${make}/${model}`,
      siteName: "Lafayette Equipment Rentals",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: `https://www.lafayetteequipmentrental.com/equipment-rental/make/${make}/${model}`,
      languages: {
        "en-US": `/en/equipment-rental/make/${make}/${model}`,
        "es-ES": `/es/equipment-rental/make/${make}/${model}`,
      },
    },
  };
}

export default async function MakeModelPage({ params }: MakeModelPageProps) {
  const { make, model } = await params;
  const machines = await getMachinesByMakeModel(make, model);

  if (machines.length === 0) {
    notFound();
  }

  const makeName = formatName(make);
  const modelName = formatName(model);

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
            <span className="text-white">
              {makeName} {modelName}
            </span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {makeName} {modelName} Rental in Lafayette, LA
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Browse our selection of {machines.length} {makeName} {modelName}{" "}
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
          equipmentType={`${makeName} ${modelName}`}
        />
      </Suspense>
    </div>
  );
}

// Generate static params for common make/model combinations
export async function generateStaticParams() {
  // Common equipment make/model combinations
  const combinations = [
    { make: "caterpillar", model: "320" },
    { make: "caterpillar", model: "336" },
    { make: "caterpillar", model: "d6" },
    { make: "john-deere", model: "310" },
    { make: "john-deere", model: "544" },
    { make: "komatsu", model: "pc200" },
    { make: "komatsu", model: "pc350" },
    { make: "jcb", model: "3cx" },
    { make: "case", model: "580" },
    { make: "bobcat", model: "s650" },
    { make: "volvo", model: "ec210" },
    { make: "hitachi", model: "zx200" },
  ];

  return combinations;
}
