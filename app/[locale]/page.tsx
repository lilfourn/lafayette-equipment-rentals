import { type Machine } from "@/components/machine-card";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { LocalBusinessSchema } from "@/components/structured-data";
import { CATEGORIES } from "@/lib/categories";
import {
  getFallbackPopularEquipment,
  getPopularMachines,
} from "@/lib/get-popular-machines";
import {
  filterOutRadiusMachines,
  getBuyItNowEverywheresMachines,
  processGlobalBuyItNowMachines,
} from "@/lib/global-machines";
import { LAFAYETTE_LOCATION } from "@/lib/location-config";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load the homepage component
const LafayetteEquipmentHomepage = dynamic(() => import("./client-page"), {
  loading: () => <PageSkeleton variant="default" />,
  ssr: true,
});

interface EquipmentCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  image?: {
    asset?: {
      url?: string;
    };
    alt?: string;
  };
}

interface Equipment {
  _id: string;
  title: string;
  slug: string;
  category: {
    name: string;
    displayName: string;
  };
  shortDescription?: string;
  keyFeatures?: string[];
  featured?: boolean;
}

interface SearchResults {
  machines: Machine[];
  error: string | null;
}

async function getEquipmentCategories(): Promise<EquipmentCategory[]> {
  return CATEGORIES.map((c) => ({
    _id: c.name,
    name: c.name,
    displayName: c.displayName,
    description: c.description,
    image: c.image
      ? { asset: { url: c.image }, alt: c.displayName }
      : undefined,
  }));
}

async function getEquipment(): Promise<Equipment[]> {
  return [];
}

async function getMachines(): Promise<SearchResults> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set. Skipping Rubbl API fetch.");
    return { machines: [], error: "Service not configured" };
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  // Lafayette, LA coordinates
  const lafayetteLat = LAFAYETTE_LOCATION.latitude;
  const lafayetteLon = LAFAYETTE_LOCATION.longitude;
  const radiusMiles = LAFAYETTE_LOCATION.serviceRadiusMiles;

  // Convert miles to kilometers for Azure Search
  const radiusInKm = radiusMiles * 1.60934;

  const filterClauses = [
    `(geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') le ${radiusInKm})`,
    "(status eq 'Available' or status eq 'Onboarding')",
    "(rentalRate ne 0)",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
  ];

  const requestBody = {
    count: true,
    filter: filterClauses.join(" and "),
    search: "",
    top: 5000,
    orderby: `geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') asc`,
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
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Rubbl API request failed:", response.status, errorText);
      return {
        machines: [],
        error: `API request failed with status ${response.status}.`,
      };
    }

    const data = await response.json();
    const radiusMachines: Machine[] = data.value || [];

    // Fetch global buy-it-now machines to supplement local inventory
    let globalBuyItNowMachines: Machine[] = [];

    try {
      const { machines: globalMachines, error: globalError } =
        await getBuyItNowEverywheresMachines();

      if (!globalError && globalMachines.length > 0) {
        // Filter out machines that are already in our radius to avoid duplicates
        const filteredGlobalMachines = filterOutRadiusMachines(
          globalMachines,
          radiusMiles
        );
        // Process the machines to set location and mark as buy-it-now-only
        globalBuyItNowMachines = processGlobalBuyItNowMachines(
          filteredGlobalMachines
        );
      }
    } catch (globalError) {
      console.error("Error fetching global buy-it-now machines:", globalError);
      // Continue without global machines if there's an error
    }

    // Combine radius machines FIRST, then global buy-it-now machines (to prioritize local inventory)
    const allMachines = [...radiusMachines, ...globalBuyItNowMachines];

    return {
      machines: allMachines,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching machines from Rubbl API:", error);
    return { machines: [], error: "Failed to fetch machine data." };
  }
}

export default async function ServerHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Await params before destructuring
  const { locale } = await params;
  const { machines, error: fetchError } = await getMachines();
  const equipmentCategories = await getEquipmentCategories();
  const equipment = await getEquipment();

  // Fetch popular machines from Rubbl API
  let popularMachines = await getPopularMachines(4);

  // Use fallback if no machines found
  if (popularMachines.length === 0) {
    console.log("No popular machines found, using fallback data");
    popularMachines = getFallbackPopularEquipment();
  }

  return (
    <>
      <LocalBusinessSchema />
      <Suspense fallback={<PageSkeleton variant="default" />}>
        <LafayetteEquipmentHomepage
          machines={machines}
          fetchError={fetchError}
          equipmentCategories={equipmentCategories}
          equipment={equipment}
          popularMachines={popularMachines}
        />
      </Suspense>
    </>
  );
}
