import type { Machine } from "@/components/machine-card";
import {
  loadCommonIndustries,
  mapLabelsToInternal,
  type IndustryConfig,
} from "./industry-config";
import { LAFAYETTE_LOCATION } from "./location-config";
import {
  searchMachines,
  type MachineSearchResponse,
  type SearchConfig,
} from "./rubbl-machine-search";

const AZURE_SEARCH_URL =
  "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30";

export interface IndustryAggregateItem {
  industry: IndustryConfig;
  machines: Machine[];
  availableCount: number;
  categoryCounts: Record<string, number>; // categorySlug -> count
}

export function buildPrimaryTypes(industry: IndustryConfig): string[] {
  const mappings = mapLabelsToInternal(industry.equipmentLabels);
  const primaryTypes = Array.from(
    new Set(mappings.map((m) => m.primaryType).filter((v): v is string => !!v))
  );
  return primaryTypes;
}

export async function searchIndustryMachines(
  industry: IndustryConfig,
  config: SearchConfig,
  top: number = 12
): Promise<MachineSearchResponse> {
  const startedAt = Date.now();
  const primaryTypes = buildPrimaryTypes(industry);
  if (primaryTypes.length === 0) {
    return { machines: [], totalCount: 0, error: null };
  }

  // Fast path: single Azure request with OR filter across primaryTypes
  if (primaryTypes.length > 1) {
    try {
      const filters: string[] = [
        "(status eq 'Available' or status eq 'Onboarding')",
        "(requiresAdminApproval eq false)",
        "(approvalStatus eq 'Approved' or approvalStatus eq null)",
        `(geo.distance(location/point, geography'POINT(${
          LAFAYETTE_LOCATION.longitude
        } ${LAFAYETTE_LOCATION.latitude})') le ${
          LAFAYETTE_LOCATION.serviceRadiusMiles * 1.60934
        })`,
      ];
      const typeClause = `(${primaryTypes
        .map((t) => `(primaryType eq '${t.replace(/'/g, "''")}')`)
        .join(" or ")})`;
      filters.push(typeClause);

      const requestBody = {
        count: true,
        filter: filters.join(" and "),
        search: "",
        searchMode: "all",
        top: Math.min(top * primaryTypes.length, 40),
        orderby: `geo.distance(location/point, geography'POINT(${LAFAYETTE_LOCATION.longitude} ${LAFAYETTE_LOCATION.latitude})') asc`,
        facets: [],
      } as const;

      const response = await fetch(AZURE_SEARCH_URL, {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        // Allow Next.js fetch cache to persist results between requests
        next: {
          revalidate: config.cacheDuration ?? 900,
          tags: ["industry-search"],
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Azure combined industry search failed:",
          response.status,
          errorText
        );
        // Fall back to per-type concurrent search
      } else {
        const data = await response.json();
        const machines: Machine[] = data.value || [];
        const durationMs = Date.now() - startedAt;
        console.info(
          `[industry-agg] industry=${industry.slug} types=${primaryTypes.length} results=${machines.length} duration=${durationMs}ms one-shot`
        );
        return { machines, totalCount: machines.length, error: null };
      }
    } catch (e) {
      // fall through to per-type path
    }
  }

  // Fallback: Run per-type searches with limited concurrency
  const concurrency = 3;
  let idx = 0;
  const results: MachineSearchResponse[] = [];
  async function worker() {
    while (idx < primaryTypes.length) {
      const current = idx++;
      const pt = primaryTypes[current];
      const res = await searchMachines(
        {
          primaryType: pt,
          location: {
            lat: LAFAYETTE_LOCATION.latitude,
            lon: LAFAYETTE_LOCATION.longitude,
            radiusMiles: LAFAYETTE_LOCATION.serviceRadiusMiles,
          },
          maxResults: top,
        },
        config
      );
      results.push(res);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, primaryTypes.length) }, worker)
  );

  // Merge and dedupe by id
  const merged: Record<string, Machine> = {};
  results.forEach((r) => {
    r.machines.forEach((m) => {
      merged[m.id] = merged[m.id] || m;
    });
  });

  const machines = Object.values(merged);
  const durationMs = Date.now() - startedAt;
  console.info(
    `[industry-agg] industry=${industry.slug} types=${primaryTypes.length} results=${machines.length} duration=${durationMs}ms`
  );
  return { machines, totalCount: machines.length, error: null };
}

export async function getIndustriesWithMachines(
  config: SearchConfig,
  topPerIndustry = 12
): Promise<IndustryAggregateItem[]> {
  const industries = loadCommonIndustries();
  const items: IndustryAggregateItem[] = [];
  const concurrency = 6;
  let idx = 0;
  async function worker() {
    while (idx < industries.length) {
      const current = idx++;
      const ind = industries[current];
      const res = await searchIndustryMachines(ind, config, topPerIndustry);
      const machines = res.machines || [];
      const availableCount = machines.length;
      const categoryCounts: Record<string, number> = {};
      machines.forEach((m) => {
        if (m.primaryType) {
          const k = m.primaryType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          categoryCounts[k] = (categoryCounts[k] || 0) + 1;
        }
      });
      const item: IndustryAggregateItem = {
        industry: ind,
        machines,
        availableCount,
        categoryCounts,
      };
      items[current] = item;
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, industries.length) }, worker)
  );
  return items;
}
