import type { Machine } from "@/components/machine-card";
import {
  getMachineCoordinates,
  isWithinLafayetteRadius,
  LAFAYETTE_LOCATION,
} from "@/lib/location-config";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { machineId: string } }
) {
  try {
    console.log("API Route - Received params:", params);
    const { machineId } = params;
    console.log("API Route - Machine ID:", machineId);

    if (!machineId) {
      console.error("API Route - No machine ID provided");
      return NextResponse.json(
        { error: "Machine ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RUBBL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 500 }
      );
    }
    console.log("API Route - Using API Key:", apiKey.substring(0, 10) + "...");

    // Use the direct document lookup endpoint
    const apiUrl = `https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/${machineId}?api-version=2020-06-30`;
    console.log("API Route - Fetching from Rubbl API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data for individual machines
    });

    console.log("API Route - Rubbl API Response Status:", response.status);
    console.log("API Route - Rubbl API Response OK:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Route - Rubbl API request failed");
      console.error("API Route - Machine ID:", machineId);
      console.error("API Route - Status:", response.status);
      console.error("API Route - Error Text:", errorText);

      if (response.status === 404) {
        return NextResponse.json(
          { error: `Machine with ID ${machineId} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch machine details", details: errorText },
        { status: response.status }
      );
    }

    const machine: Machine = await response.json();
    console.log(
      "API Route - Successfully fetched machine:",
      machine.id,
      machine.make,
      machine.model
    );

    // Check if machine is outside Lafayette radius and mark as buy-it-now-only if applicable
    const coords = getMachineCoordinates(machine);
    const isOutsideRadius = coords
      ? !isWithinLafayetteRadius(coords.lat, coords.lon)
      : false;

    // If machine is outside radius and has buy-it-now, mark as buy-it-now-only
    if (isOutsideRadius && machine.buyItNowEnabled) {
      machine.buyItNowOnly = true;
      // Override location to show Lafayette for buy-it-now-only machines
      machine.location = {
        ...machine.location,
        city: LAFAYETTE_LOCATION.city,
        state: LAFAYETTE_LOCATION.state,
        address: {
          ...machine.location?.address,
          city: LAFAYETTE_LOCATION.city,
          stateProvince: LAFAYETTE_LOCATION.state,
        },
      };
    }

    console.log("API Route - Returning machine data to client");
    return NextResponse.json(machine);
  } catch (error) {
    console.error("API Route - Caught error:", error);
    console.error("API Route - Error type:", typeof error);
    console.error(
      "API Route - Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error: "Internal server error while fetching machine details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
