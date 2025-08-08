import { LAFAYETTE_LOCATION } from "@/lib/location-config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.RUBBL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { machines: [], error: "Service not configured" },
        { status: 500 }
      );
    }

    const apiUrl =
      "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

    const lafayetteLat = LAFAYETTE_LOCATION.latitude;
    const lafayetteLon = LAFAYETTE_LOCATION.longitude;
    const radiusInKm = LAFAYETTE_LOCATION.serviceRadiusMiles * 1.60934;

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
      top: 25,
      orderby: "buyItNowPrice asc",
      facets: [],
    };

    let localMachines: any[] = [];
    let globalMachines: any[] = [];

    const localResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localRequestBody),
      next: { revalidate: 900, tags: ["machines"] },
    });

    if (localResponse.ok) {
      const localData = await localResponse.json();
      localMachines = localData.value || [];
    }

    try {
      const {
        getBuyItNowEverywheresMachines,
        processGlobalBuyItNowMachines,
        filterOutRadiusMachines,
      } = await import("@/lib/global-machines");
      const { machines: allGlobalMachines, error: globalError } =
        await getBuyItNowEverywheresMachines();
      if (!globalError && allGlobalMachines.length > 0) {
        const filteredGlobalMachines = filterOutRadiusMachines(
          allGlobalMachines,
          50
        );
        globalMachines = processGlobalBuyItNowMachines(
          filteredGlobalMachines.slice(0, 25)
        );
      }
    } catch (e) {
      // ignore global fetch errors
    }

    const allMachines = [...localMachines, ...globalMachines];
    return NextResponse.json(
      { machines: allMachines, error: null },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { machines: [], error: "Failed to fetch buy now machines" },
      { status: 500 }
    );
  }
}
