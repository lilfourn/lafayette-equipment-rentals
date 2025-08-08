/**
 * Rubbl Machine Search Utility
 * A reusable, professional-grade machine search module for Rubbl API integration
 * Can be easily copied and used in other projects
 */

import type { Machine } from "@/components/machine-card";
import {
  LAFAYETTE_LOCATION,
  getMachineCoordinates,
  isWithinLafayetteRadius,
} from "./location-config";

/**
 * Search criteria for finding machines
 */
export interface MachineSearchCriteria {
  /** Primary equipment type (e.g., "Scissor Lift", "Telehandler") */
  primaryType?: string;

  /** Equipment make/manufacturer */
  make?: string;

  /** Equipment model */
  model?: string;

  /** Keywords to search in title/description */
  keywords?: string[];

  /** Location-based search */
  location?: {
    lat: number;
    lon: number;
    radiusMiles: number;
  };

  /** Minimum capacity (e.g., weight capacity for telehandlers) */
  minCapacity?: number;

  /** Maximum capacity */
  maxCapacity?: number;

  /** Catalog class number (e.g., "300-2000") */
  catClass?: string;

  /** Maximum number of results to return */
  maxResults?: number;
}

/**
 * Search response structure
 */
export interface MachineSearchResponse {
  machines: Machine[];
  totalCount: number;
  error: string | null;
}

/**
 * Configuration for the search utility
 */
export interface SearchConfig {
  apiKey: string;
  apiUrl?: string;
  cacheEnabled?: boolean;
  cacheDuration?: number; // in seconds
  // Rate limiting
  maxRequestsPerSecond?: number; // default 2 rps
  maxRetries?: number; // default 3
  retryBaseDelayMs?: number; // default 250ms
}

// Simple in-memory cache
const searchCache = new Map<
  string,
  { data: MachineSearchResponse; timestamp: number }
>();

// Simple token-bucket style limiter shared across module
let lastRefill = Date.now();
let tokens = 0;
function takeToken(maxRPS: number): Promise<void> {
  const capacity = Math.max(1, maxRPS);
  const refillInterval = 1000 / capacity; // ms per token
  return new Promise((resolve) => {
    const tryTake = () => {
      const now = Date.now();
      const elapsed = now - lastRefill;
      const refill = Math.floor(elapsed / refillInterval);
      if (refill > 0) {
        tokens = Math.min(capacity, tokens + refill);
        lastRefill = now - (elapsed % refillInterval);
      }
      if (tokens > 0) {
        tokens -= 1;
        resolve();
        return;
      }
      setTimeout(tryTake, Math.max(5, Math.floor(refillInterval / 4)));
    };
    tryTake();
  });
}

/**
 * Generates a cache key from search criteria
 */
function generateCacheKey(criteria: MachineSearchCriteria): string {
  return JSON.stringify(criteria);
}

/**
 * Builds OData filter clauses from search criteria
 */
function buildFilterClauses(criteria: MachineSearchCriteria): string[] {
  const filters: string[] = [
    "(status eq 'Available' or status eq 'Onboarding')",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
  ];

  // Add location filter if provided
  if (criteria.location) {
    const { lat, lon, radiusMiles } = criteria.location;
    const radiusInKm = radiusMiles * 1.60934;
    filters.push(
      `(geo.distance(location/point, geography'POINT(${lon} ${lat})') le ${radiusInKm})`
    );
  }

  // Add type filter
  if (criteria.primaryType) {
    filters.push(`(primaryType eq '${criteria.primaryType}')`);
  }

  // Add make filter
  if (criteria.make) {
    filters.push(`(make eq '${criteria.make}')`);
  }

  // Add model filter
  if (criteria.model) {
    filters.push(`(model eq '${criteria.model}')`);
  }

  // Add capacity filters
  if (criteria.minCapacity !== undefined) {
    filters.push(`(capacity ge ${criteria.minCapacity})`);
  }

  if (criteria.maxCapacity !== undefined) {
    filters.push(`(capacity le ${criteria.maxCapacity})`);
  }

  return filters;
}

/**
 * Builds search query from keywords
 */
function buildSearchQuery(keywords?: string[]): string {
  if (!keywords || keywords.length === 0) {
    return "";
  }

  // Expand each token to support prefix and fuzzy matching in Azure Search (Lucene syntax)
  // Examples: "contain* OR contain~1"
  const expanded = keywords
    .map((raw) => {
      const token = String(raw).trim();
      if (!token) return "";
      // Detect and strip trailing '*' if present (from tokenization), then build both variants
      const base = token.endsWith("*") ? token.slice(0, -1) : token;
      if (base.length === 0) return "";
      const parts: string[] = [];
      // Prefix match
      parts.push(`${base}*`);
      // Fuzzy match (edit distance 1) for minor typos, only for tokens length >= 3
      if (base.length >= 3) {
        parts.push(`${base}~1`);
      }
      return parts.length > 1 ? `(${parts.join(" OR ")})` : parts[0];
    })
    .filter(Boolean);

  return expanded.join(" OR ");
}

/**
 * Main search function - searches for machines in Rubbl API
 */
export async function searchMachines(
  criteria: MachineSearchCriteria,
  config: SearchConfig
): Promise<MachineSearchResponse> {
  try {
    const startedAt = Date.now();
    // Check cache if enabled
    if (config.cacheEnabled) {
      const cacheKey = generateCacheKey(criteria);
      const cached = searchCache.get(cacheKey);

      if (cached) {
        const age = (Date.now() - cached.timestamp) / 1000;
        if (age < (config.cacheDuration || 300)) {
          console.info(
            `[industry-search] cache hit age=${Math.round(age)}s criteria=${
              criteria.primaryType || "multi"
            }`
          );
          return cached.data;
        }
      }
    }

    const apiUrl =
      config.apiUrl ||
      "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

    // Build filter clauses
    const filterClauses = buildFilterClauses(criteria);

    // Build search query
    const searchQuery = buildSearchQuery(criteria.keywords);

    // Build request body
    const requestBody = {
      count: true,
      filter: filterClauses.join(" and "),
      search: searchQuery,
      searchMode: searchQuery ? "any" : "all",
      queryType: searchQuery ? "full" : undefined,
      top: criteria.maxResults || 50,
      orderby: criteria.location
        ? `geo.distance(location/point, geography'POINT(${criteria.location.lon} ${criteria.location.lat})') asc`
        : undefined,
      facets: [],
    };

    // Compact one-liner for outbound search
    console.info(
      `[industry-search] req type=${criteria.primaryType || "multi"} top=${
        criteria.maxResults || 50
      } radius=${criteria.location?.radiusMiles ?? "-"}mi`
    );

    // Rate limit outgoing requests
    const maxRPS = config.maxRequestsPerSecond ?? 2;
    await takeToken(maxRPS);

    // Exponential backoff with jitter for 429/503
    const maxRetries = config.maxRetries ?? 3;
    const baseDelay = config.retryBaseDelayMs ?? 250;
    let attempt = 0;
    let response: Response | null = null;
    while (attempt <= maxRetries) {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });
      if (response.ok) break;

      if (response.status === 429 || response.status === 503) {
        const delay =
          baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 100);
        await new Promise((r) => setTimeout(r, delay));
        attempt += 1;
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const errorText = await response.text();
      console.error("Rubbl API search failed:", response.status, errorText);
      return {
        machines: [],
        totalCount: 0,
        error: `Search failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    const result: MachineSearchResponse = {
      machines: data.value || [],
      totalCount: data["@odata.count"] || 0,
      error: null,
    };

    // Process machines for buy-it-now-only flag if needed
    result.machines = result.machines.map((machine) => {
      const coords = getMachineCoordinates(machine);
      const isOutsideRadius = coords
        ? !isWithinLafayetteRadius(coords.lat, coords.lon)
        : false;

      if (isOutsideRadius && machine.buyItNowEnabled) {
        return {
          ...machine,
          buyItNowOnly: true,
          location: {
            ...machine.location,
            city: LAFAYETTE_LOCATION.city,
            state: LAFAYETTE_LOCATION.state,
            address: {
              ...machine.location?.address,
              city: LAFAYETTE_LOCATION.city,
              stateProvince: LAFAYETTE_LOCATION.state,
            },
          },
        };
      }

      return machine;
    });

    // Cache the result if caching is enabled
    if (config.cacheEnabled) {
      const cacheKey = generateCacheKey(criteria);
      searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
    }

    const durationMs = Date.now() - startedAt;
    console.info(
      `[industry-search] res count=${
        result.totalCount
      } duration=${durationMs}ms type=${criteria.primaryType || "multi"}`
    );
    return result;
  } catch (error) {
    console.error("Error searching machines:", error);
    return {
      machines: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Searches for a single machine matching the criteria
 */
export async function searchSingleMachine(
  criteria: MachineSearchCriteria,
  config: SearchConfig
): Promise<Machine | null> {
  const searchCriteria = {
    ...criteria,
    maxResults: 1,
  };

  const result = await searchMachines(searchCriteria, config);

  if (result.error || result.machines.length === 0) {
    console.log("No machine found matching criteria:", criteria);
    return null;
  }

  return result.machines[0];
}

/**
 * Searches for machines by catalog class number
 * This is a specialized search for equipment with known catalog numbers
 */
export async function searchByCatalogClass(
  catClass: string,
  config: SearchConfig
): Promise<Machine | null> {
  // First try searching by the catalog class in various fields
  const searchCriteria: MachineSearchCriteria = {
    keywords: [catClass],
    maxResults: 5,
    location: {
      lat: LAFAYETTE_LOCATION.latitude,
      lon: LAFAYETTE_LOCATION.longitude,
      radiusMiles: LAFAYETTE_LOCATION.serviceRadiusMiles,
    },
  };

  const result = await searchMachines(searchCriteria, config);

  if (result.machines.length > 0) {
    // Try to find exact match or closest match
    const exactMatch = result.machines.find(
      (m) => m.model?.includes(catClass) || m.displayName?.includes(catClass)
    );

    return exactMatch || result.machines[0];
  }

  return null;
}

/**
 * Clear the search cache
 */
export function clearSearchCache(): void {
  searchCache.clear();
  console.log("Search cache cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: searchCache.size,
    entries: Array.from(searchCache.keys()),
  };
}
