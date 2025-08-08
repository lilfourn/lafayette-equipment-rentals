import { type Machine } from "@/components/machine-card";
import PageSkeleton from "@/components/skeletons/page-skeleton";
import { LAFAYETTE_LOCATION } from "@/lib/location-config";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";

// Lazy load the buy now page content
const BuyNowPageContent = dynamic(
  () => import("@/components/buy-now-page-content"),
  {
    loading: () => <PageSkeleton variant="listing" />,
    ssr: true,
  }
);

interface SearchResults {
  machines: Machine[];
  error: string | null;
}

async function getAllBuyItNowMachines(): Promise<SearchResults> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error("RUBBL_API_KEY is not set.");
    return { machines: [], error: "Service not configured" };
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  // Lafayette, LA coordinates
  const lafayetteLat = LAFAYETTE_LOCATION.latitude;
  const lafayetteLon = LAFAYETTE_LOCATION.longitude;
  const radiusInKm = LAFAYETTE_LOCATION.serviceRadiusMiles * 1.60934;

  // First, get local buy-it-now machines
  const localFilterClauses = [
    `(geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') le ${radiusInKm})`,
    "(status eq 'Available' or status eq 'Onboarding')",
    "(buyItNowEnabled eq true)",
    "(buyItNowPrice gt 0)",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
  ];

  const localRequestBody = {
    count: true,
    filter: localFilterClauses.join(" and "),
    search: "",
    searchMode: "all",
    top: 100, // Get more machines for the dedicated page
    orderby: "buyItNowPrice asc",
    facets: [],
  };

  try {
    let localMachines: Machine[] = [];
    let globalMachines: Machine[] = [];

    // Fetch local buy-it-now machines
    const localResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localRequestBody),
      next: {
        revalidate: 900, // Revalidate every 15 minutes
        tags: ["machines", "buy-now"],
      },
    });

    if (localResponse.ok) {
      const localData = await localResponse.json();
      localMachines = localData.value || [];
    }

    // Fetch global buy-it-now machines
    try {
      const {
        getBuyItNowEverywheresMachines,
        processGlobalBuyItNowMachines,
        filterOutRadiusMachines,
      } = await import("@/lib/global-machines");

      const { machines: allGlobalMachines, error: globalError } =
        await getBuyItNowEverywheresMachines();

      if (!globalError && allGlobalMachines.length > 0) {
        // Filter out machines that are already in our local results
        const filteredGlobalMachines = filterOutRadiusMachines(
          allGlobalMachines,
          50
        );
        // Process them to mark as buy-it-now-only and set location to Lafayette
        globalMachines = processGlobalBuyItNowMachines(filteredGlobalMachines);
      }
    } catch (globalError) {
      console.error("Error fetching global buy-it-now machines:", globalError);
    }

    // Combine local and global machines
    const allMachines = [...localMachines, ...globalMachines];

    // Extract unique categories and price ranges for filters
    const categories = new Set<string>();
    const priceRanges = {
      under5k: 0,
      "5kTo10k": 0,
      "10kTo25k": 0,
      "25kTo50k": 0,
      over50k: 0,
    };

    allMachines.forEach((machine) => {
      if (machine.primaryType) {
        categories.add(machine.primaryType);
      }

      const price = machine.buyItNowPrice || 0;
      if (price < 5000) priceRanges.under5k++;
      else if (price < 10000) priceRanges["5kTo10k"]++;
      else if (price < 25000) priceRanges["10kTo25k"]++;
      else if (price < 50000) priceRanges["25kTo50k"]++;
      else priceRanges.over50k++;
    });

    return {
      machines: allMachines,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching buy it now machines:", error);
    return { machines: [], error: "Failed to fetch buy it now machines." };
  }
}

export default async function BuyNowPage() {
  const buyNowResults = await getAllBuyItNowMachines();

  return (
    <BuyNowPageContent
      initialMachines={buyNowResults.machines}
      error={buyNowResults.error}
    />
  );
}
