import {
  searchMachinesNear,
  tokenizeKeywords,
} from "@/lib/centralized-machine-search";
import { NextResponse } from "next/server";

/**
 * GET /api/machine/nearby
 * Query params:
 * - lat, lon: coordinates (defaults to Lafayette)
 * - radius: radius in miles (default 50)
 * - q: freeform text, tokenized into keywords
 * - type, make, model: optional filters
 * - limit: max results (default 50)
 * - rentalsOnly: "true" to filter to items with rental rates
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius");
    const q = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type") || undefined;
    const make = searchParams.get("make") || undefined;
    const model = searchParams.get("model") || undefined;
    const limit = searchParams.get("limit");
    const rentalsOnly = searchParams.get("rentalsOnly") === "true";

    const keywords = q ? tokenizeKeywords(q) : undefined;

    const result = await searchMachinesNear({
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      radiusMiles: radius ? parseFloat(radius) : 50,
      keywords,
      primaryType: type,
      make,
      model,
      limit: limit ? parseInt(limit) : 50,
      rentalsOnly,
    });

    if (result.error) {
      return NextResponse.json(
        { machines: [], error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      machines: result.machines,
      totalCount: result.totalCount,
    });
  } catch (err) {
    console.error("Nearby search error", err);
    return NextResponse.json(
      { machines: [], error: "Internal error" },
      { status: 500 }
    );
  }
}
