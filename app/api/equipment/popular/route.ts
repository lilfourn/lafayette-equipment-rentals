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
      searchMode: "all",
      top: 10,
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
      next: { revalidate: 900, tags: ["machines"] },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          machines: [],
          error: `API request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { machines: data.value || [], error: null },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { machines: [], error: "Failed to fetch popular rentals" },
      { status: 500 }
    );
  }
}
