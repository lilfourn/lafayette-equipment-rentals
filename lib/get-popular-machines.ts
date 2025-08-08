/**
 * Server-side function to fetch popular machines from Rubbl API
 * Gets real, available machines to display as popular equipment
 */

import type { Machine } from "@/components/machine-card";
import { LAFAYETTE_LOCATION } from "./location-config";

export interface PopularMachine extends Machine {
  popularity?: number;
  featured?: boolean;
}

/**
 * Fetches popular machines from the Rubbl API
 * Returns a mix of different equipment types that are actually available
 */
export async function getPopularMachines(
  limit: number = 4
): Promise<PopularMachine[]> {
  const startedAt = Date.now();
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    console.error(
      "RUBBL_API_KEY is not set. Returning empty popular machines."
    );
    return [];
  }
  const apiUrl =
    "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

  // Lafayette, LA coordinates
  const lafayetteLat = LAFAYETTE_LOCATION.latitude;
  const lafayetteLon = LAFAYETTE_LOCATION.longitude;
  const radiusInKm = LAFAYETTE_LOCATION.serviceRadiusMiles * 1.60934;

  // Define popular equipment types to fetch - using broader search terms
  // Exclude storage containers by using more specific equipment searches
  const popularTypes = [
    { search: "skid steer", type: "Skid Steer", count: 1 },
    { search: "excavator", type: "Excavator", count: 1 },
    { search: "dozer", type: "Dozer", count: 1 },
    { search: "loader", type: "Loader", count: 1 },
  ];

  const allMachines: PopularMachine[] = [];

  try {
    // Fetch one machine of each popular type
    for (const { search, type, count } of popularTypes) {
      const filterClauses = [
        `(geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') le ${radiusInKm})`,
        "(status eq 'Available' or status eq 'Onboarding')",
        "(primaryType ne 'Storage Container')", // Exclude storage containers
        "(requiresAdminApproval eq false)",
        "(approvalStatus eq 'Approved' or approvalStatus eq null)",
      ];

      const requestBody = {
        count: true,
        filter: filterClauses.join(" and "),
        search: search, // Use search term instead of exact type filter
        searchMode: "any",
        top: count,
        orderby: `geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') asc`,
        facets: [],
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ["popular-machines"],
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.value && data.value.length > 0) {
          // Add the first machine of this type
          allMachines.push(...data.value.slice(0, count));
        } else {
          // no-op: keep logging compact
        }
      } else {
        console.error(`Failed to fetch ${type} machines:`, response.status);
      }
    }

    // If we don't have enough machines, fetch some general popular ones
    if (allMachines.length < limit) {
      const generalFilterClauses = [
        `(geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') le ${radiusInKm})`,
        "(status eq 'Available' or status eq 'Onboarding')",
        "(primaryType ne 'Storage Container')", // Exclude storage containers
        "(requiresAdminApproval eq false)",
        "(approvalStatus eq 'Approved' or approvalStatus eq null)",
      ];

      const generalRequestBody = {
        count: true,
        filter: generalFilterClauses.join(" and "),
        search: "",
        searchMode: "all",
        top: Math.max(10, limit - allMachines.length), // Get at least 10 to have options
        orderby: `geo.distance(location/point, geography'POINT(${lafayetteLon} ${lafayetteLat})') asc`,
        facets: [],
      };

      const generalResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generalRequestBody),
        next: {
          revalidate: 3600,
          tags: ["popular-machines"],
        },
      });

      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        if (generalData.value && generalData.value.length > 0) {
          // Add machines that aren't already in our list
          const existingIds = new Set(allMachines.map((m) => m.id));
          const newMachines = generalData.value.filter(
            (m: Machine) => !existingIds.has(m.id)
          );
          allMachines.push(...newMachines.slice(0, limit - allMachines.length));
        }
      } else {
        console.error(
          "Failed to fetch general machines:",
          generalResponse.status
        );
      }
    }

    // Process machines: handle images and convert rate schedules to daily/weekly/monthly format
    const processedMachines = allMachines.map((machine) => {
      // Process thumbnails
      if (machine.thumbnails && Array.isArray(machine.thumbnails)) {
        machine.thumbnails = machine.thumbnails.map((url) => {
          if (!url) return url;
          if (url.startsWith("http")) return url;
          if (url.startsWith("/pubweb/") || url.startsWith("pubweb/")) {
            const cleanPath = url.startsWith("/") ? url.slice(1) : url;
            return `https://kimberrubblstg.blob.core.windows.net/${cleanPath}`;
          }
          return `https://kimberrubblstg.blob.core.windows.net/${url}`;
        });
      }

      // Process images
      if (machine.images && Array.isArray(machine.images)) {
        machine.images = machine.images.map((url) => {
          if (!url) return url;
          if (url.startsWith("http")) return url;
          if (url.startsWith("/pubweb/") || url.startsWith("pubweb/")) {
            const cleanPath = url.startsWith("/") ? url.slice(1) : url;
            return `https://kimberrubblstg.blob.core.windows.net/${cleanPath}`;
          }
          return `https://kimberrubblstg.blob.core.windows.net/${url}`;
        });
      }

      // Convert rateSchedules to daily/weekly/monthly format if available
      if (machine.rateSchedules && Array.isArray(machine.rateSchedules)) {
        const rates: any = {};

        machine.rateSchedules.forEach((schedule) => {
          const label = schedule.label?.toUpperCase();
          // Check for daily rate
          if (label === "DAY" || schedule.numDays === 1) {
            rates.daily = schedule.cost;
          }
          // Check for weekly rate
          else if (label === "WEEK" || schedule.numDays === 7) {
            rates.weekly = schedule.cost;
          }
          // Check for monthly rate (28-30 days)
          else if (
            label === "MONTH" ||
            label === "4 WKS" ||
            schedule.numDays === 28 ||
            schedule.numDays === 30
          ) {
            rates.monthly = schedule.cost;
          }
          // Check for 3-month rate and divide by 3 to get monthly
          else if (label === "3 MOS" && schedule.numDays === 84) {
            // Divide 3-month rate by 3 to get approximate monthly rate
            if (!rates.monthly) {
              rates.monthly = Math.round(schedule.cost / 3);
            }
          }
        });

        // If we still don't have a monthly rate but have a rentalRate number, use that
        if (!rates.monthly && typeof machine.rentalRate === "number") {
          rates.monthly = machine.rentalRate;
        }

        // Only override rentalRate if we found rates in the schedule
        if (rates.daily || rates.weekly || rates.monthly) {
          machine.rentalRate = rates;
        }
      }

      return machine;
    });

    // Compact summary log (single line)
    const durationMs = Date.now() - startedAt;
    const typeSummary = Array.from(
      new Set(
        processedMachines
          .map((m) => m.primaryType)
          .filter((v): v is string => !!v)
      )
    )
      .slice(0, 6)
      .join(", ");
    console.info(
      `[popular] total=${processedMachines.length} duration=${durationMs}ms types=[${typeSummary}]`
    );

    return processedMachines.slice(0, limit);
  } catch (error) {
    console.error("Error fetching popular machines:", error);
    return [];
  }
}

/**
 * Get fallback popular equipment data for when API is unavailable
 */
export function getFallbackPopularEquipment(): any[] {
  return [
    {
      id: "fallback-1",
      make: "Generic",
      model: "Scissor Lift",
      displayName: "19 ft. Scissor Lift, Electric",
      primaryType: "Scissor Lift",
      thumbnails: ["/category images/scissor_lift.png"],
      images: ["/category images/scissor_lift.png"],
      location: {
        city: "Lafayette",
        state: "LA",
      },
      rentalRate: {
        daily: 150,
        weekly: 600,
        monthly: 1800,
      },
    },
    {
      id: "fallback-2",
      make: "Generic",
      model: "Telehandler",
      displayName: "5,000 lb. Telehandler",
      primaryType: "Telehandler",
      thumbnails: ["/category images/telehandler.png"],
      images: ["/category images/telehandler.png"],
      location: {
        city: "Lafayette",
        state: "LA",
      },
      rentalRate: {
        daily: 300,
        weekly: 1200,
        monthly: 3600,
      },
    },
    {
      id: "fallback-3",
      make: "Generic",
      model: "Man Lift",
      displayName: "One-Person Lift, Electric",
      primaryType: "Lift",
      thumbnails: ["/category images/man_lift.png"],
      images: ["/category images/man_lift.png"],
      location: {
        city: "Lafayette",
        state: "LA",
      },
      rentalRate: {
        daily: 125,
        weekly: 500,
        monthly: 1500,
      },
    },
    {
      id: "fallback-4",
      make: "Generic",
      model: "Forklift",
      displayName: "5,000 lb. Forklift",
      primaryType: "Forklift",
      thumbnails: ["/category images/telehandler.png"],
      images: ["/category images/telehandler.png"],
      location: {
        city: "Lafayette",
        state: "LA",
      },
      rentalRate: {
        daily: 200,
        weekly: 800,
        monthly: 2400,
      },
    },
  ];
}
