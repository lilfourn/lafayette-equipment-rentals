import { getIndustriesWithMachines } from "@/lib/industry-search";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.RUBBL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { items: [], error: "Service not configured" },
        { status: 500 }
      );
    }
    const items = await getIndustriesWithMachines(
      {
        apiKey,
        cacheEnabled: true,
        cacheDuration: 900,
      },
      8
    );
    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { items: [], error: "Failed to load industries" },
      { status: 500 }
    );
  }
}
