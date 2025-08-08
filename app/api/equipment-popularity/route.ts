import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.RUBBL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({}, { status: 500 });
    }
    const apiUrl =
      "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

    const lafayetteLat = 30.2241;
    const lafayetteLon = -92.0198;
    const radiusInKm = 80.47;

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
      top: 0, // We only want facets, not actual results
      facets: ["primaryType,count:100"], // Get counts for all equipment types
    };

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
      console.error("Rubbl API request failed:", response.status);
      return NextResponse.json({}, { status: 500 });
    }

    const data = await response.json();
    const facets = data["@search.facets"]?.primaryType || [];

    // Convert facets to popularity map
    const popularityMap: Record<string, number> = {};
    facets.forEach((facet: { value: string; count: number }) => {
      popularityMap[facet.value.toLowerCase()] = facet.count;
    });

    return NextResponse.json(popularityMap);
  } catch (error) {
    console.error("Error fetching equipment popularity:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
