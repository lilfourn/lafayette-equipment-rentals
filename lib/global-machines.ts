import { type Machine } from '@/components/machine-card'
import { LAFAYETTE_LOCATION, getMachineCoordinates, isWithinLafayetteRadius } from './location-config'

interface SearchResults {
  machines: Machine[]
  error: string | null
}

/**
 * Fetches buy-it-now machines from everywhere (no radius restriction)
 */
export async function getBuyItNowEverywheresMachines(): Promise<SearchResults> {
  const apiKey = process.env.RUBBL_API_KEY || "YOUR_RUBBL_API_KEY_PLACEHOLDER"
  const apiUrl = "https://kimber-rubbl-search.search.windows.net/indexes/machines/docs/search?api-version=2020-06-30"

  const filterClauses = [
    "(status eq 'Available' or status eq 'Onboarding')",
    "(buyItNowEnabled eq true)",
    "(buyItNowPrice gt 0)",
    "(requiresAdminApproval eq false)",
    "(approvalStatus eq 'Approved' or approvalStatus eq null)",
  ]

  const requestBody = {
    count: true,
    filter: filterClauses.join(" and "),
    search: "",
    searchMode: "all",
    top: 1000, // Get more machines since we're searching globally
    orderby: "buyItNowPrice asc", // Sort by price low to high
    facets: [],
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Rubbl API request for global buy-it-now machines failed:", response.status, errorText)
      return { machines: [], error: `API request failed with status ${response.status}.` }
    }

    const data = await response.json()

    return {
      machines: data.value || [],
      error: null,
    }
  } catch (error: any) {
    console.error("Error fetching global buy-it-now machines from Rubbl API:", error)
    return { machines: [], error: "Failed to fetch global buy-it-now machine data." }
  }
}

/**
 * Processes global buy-it-now machines that are OUTSIDE the Lafayette radius
 * by setting their location to Lafayette, LA and marking them as buy-it-now-only
 */
export function processGlobalBuyItNowMachines(machines: Machine[]): Machine[] {
  return machines
    .filter(machine => !isMachineInLafayetteRadius(machine)) // Only process machines outside radius
    .map((machine, index) => {
      // Log first 3 machines to verify they're from outside the radius
      if (index < 3) {
        const coords = getMachineCoordinates(machine);
        const originalLocation = `${machine.location?.city || 'Unknown'}, ${machine.location?.state || 'Unknown'}`;
        console.log(`[Buy-Now Machine ${index + 1}] Original location: ${originalLocation}, Coords: ${coords ? `${coords.lat}, ${coords.lon}` : 'N/A'}`);
      }
      
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
          }
        }
      }
    })
}

/**
 * Checks if a machine is within the Lafayette radius to avoid duplicates
 * Lafayette, LA coordinates: 30.2241, -92.0198
 */
export function isMachineInLafayetteRadius(machine: Machine, radiusMiles: number = LAFAYETTE_LOCATION.serviceRadiusMiles): boolean {
  const coords = getMachineCoordinates(machine)
  
  if (!coords) {
    // If we can't determine location, assume it's not in radius
    return false
  }
  
  return isWithinLafayetteRadius(coords.lat, coords.lon, radiusMiles)
}

/**
 * Filters out machines that are already in the Lafayette radius to avoid duplicates
 */
export function filterOutRadiusMachines(machines: Machine[], radiusMiles: number = LAFAYETTE_LOCATION.serviceRadiusMiles): Machine[] {
  return machines.filter(machine => !isMachineInLafayetteRadius(machine, radiusMiles))
} 