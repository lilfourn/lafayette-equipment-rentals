import type { Machine } from "@/components/machine-card";
import { LAFAYETTE_LOCATION } from "./location-config";
import {
  searchMachines,
  type MachineSearchCriteria,
  type MachineSearchResponse,
} from "./rubbl-machine-search";

export interface NearbySearchParams {
  lat?: number;
  lon?: number;
  radiusMiles?: number; // default 50
  keywords?: string[];
  primaryType?: string;
  make?: string;
  model?: string;
  limit?: number; // default 50
  rentalsOnly?: boolean; // filter out items without rental rates
}

export interface NearbySearchResult {
  machines: Machine[];
  totalCount: number;
  error: string | null;
}

function hasRentalRate(machine: Machine): boolean {
  if (typeof machine.rentalRate === "number") {
    return machine.rentalRate > 0;
  }
  if (machine.rentalRate && typeof machine.rentalRate === "object") {
    const { daily, weekly, monthly } = machine.rentalRate as any;
    return Boolean(
      (daily && daily > 0) || (weekly && weekly > 0) || (monthly && monthly > 0)
    );
  }
  if (Array.isArray((machine as any).rateSchedules)) {
    return (machine as any).rateSchedules.some((s: any) => Number(s?.cost) > 0);
  }
  return false;
}

/**
 * Centralized helper to fetch machines near a location (defaults to Lafayette).
 * Accepts lat/lon/radius and common filters. Always queries within radiusMiles (default 50).
 */
export async function searchMachinesNear(
  params: NearbySearchParams
): Promise<NearbySearchResult> {
  const apiKey = process.env.RUBBL_API_KEY;
  if (!apiKey) {
    return { machines: [], totalCount: 0, error: "Service not configured" };
  }

  const lat = params.lat ?? LAFAYETTE_LOCATION.latitude;
  const lon = params.lon ?? LAFAYETTE_LOCATION.longitude;
  const radiusMiles = params.radiusMiles ?? 50;

  const criteria: MachineSearchCriteria = {
    location: { lat, lon, radiusMiles },
    keywords: params.keywords,
    primaryType: params.primaryType,
    make: params.make,
    model: params.model,
    maxResults: params.limit ?? 50,
  };

  const result: MachineSearchResponse = await searchMachines(criteria, {
    apiKey,
    cacheEnabled: true,
    cacheDuration: 300,
  });

  if (result.error) {
    return { machines: [], totalCount: 0, error: result.error };
  }

  let machines = result.machines;
  if (params.rentalsOnly) {
    machines = machines.filter(hasRentalRate);
  }

  return { machines, totalCount: result.totalCount, error: null };
}

/**
 * Utility to tokenize a freeform query string into keywords for the search API
 */
export function tokenizeKeywords(query: string, max: number = 6): string[] {
  // Split query into tokens, keep alphanumerics and dashes, and append '*' to enable prefix matching
  // This relies on queryType: "full" in the downstream search request
  return query
    .split(/\s+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .map((token) => token.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter(Boolean)
    .map((token) => (token.length >= 2 ? `${token}*` : token))
    .slice(0, max);
}
