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

  try {
    // Only fetch global buy-it-now machines (outside 50-mile radius)
    const {
      getBuyItNowEverywheresMachines,
      processGlobalBuyItNowMachines,
      filterOutRadiusMachines,
    } = await import("@/lib/global-machines");

    const { machines: allGlobalMachines, error: globalError } =
      await getBuyItNowEverywheresMachines();

    if (globalError || !allGlobalMachines || allGlobalMachines.length === 0) {
      return { 
        machines: [], 
        error: globalError || "No buy-it-now machines available outside service area." 
      };
    }

    // Filter out machines that are within the 50-mile radius
    const filteredGlobalMachines = filterOutRadiusMachines(
      allGlobalMachines,
      50
    );

    console.log(`[Buy-Now] Total global machines: ${allGlobalMachines.length}`);
    console.log(`[Buy-Now] Machines outside 50-mile radius: ${filteredGlobalMachines.length}`);

    // Process them to mark as buy-it-now-only and set location to Lafayette
    const processedMachines = processGlobalBuyItNowMachines(filteredGlobalMachines);

    return {
      machines: processedMachines,
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
