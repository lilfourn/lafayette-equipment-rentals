import { type Machine } from '@/components/machine-card'
import { LAFAYETTE_LOCATION, getMachineCoordinates, isWithinLafayetteRadius } from './location-config'

/**
 * Formats a city name into a URL-friendly slug
 * @param city City name (e.g., "New Orleans" or "Lafayette")
 * @param state State code (e.g., "LA")
 * @returns Formatted slug (e.g., "new-orleans-la" or "lafayette-la")
 */
function formatCitySlug(city?: string, state?: string): string {
  const cityPart = (city || LAFAYETTE_LOCATION.city)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
  
  const statePart = (state || LAFAYETTE_LOCATION.state).toLowerCase()
  
  return `${cityPart}-${statePart}`
}

/**
 * Generates the appropriate machine detail URL based on the machine's location
 * 
 * Rules:
 * - Machines marked as buyItNowOnly: always use lafayette-la
 * - Machines outside 50-mile radius: always use lafayette-la
 * - Machines within 50-mile radius: use their actual city
 * 
 * @param machine The machine object
 * @param locale Optional locale for internationalization (defaults to 'en')
 * @returns The full URL path for the machine detail page
 */
export function getMachineDetailUrl(machine: Machine, locale: string = 'en'): string {
  let citySlug: string
  
  // Check if machine is buyItNowOnly (global machines are marked as such)
  if (machine.buyItNowOnly) {
    citySlug = 'lafayette-la'
  } else {
    // Check if machine is within Lafayette radius
    const coords = getMachineCoordinates(machine)
    
    if (!coords || !isWithinLafayetteRadius(coords.lat, coords.lon)) {
      // Machine is outside radius or location unknown - use Lafayette
      citySlug = 'lafayette-la'
    } else {
      // Machine is within radius - use actual location
      // Try different location formats in the machine object
      let city: string | undefined
      let state: string | undefined
      
      if (machine.location?.address?.city && machine.location?.address?.stateProvince) {
        city = machine.location.address.city
        state = machine.location.address.stateProvince
      } else if (machine.location?.city && machine.location?.state) {
        city = machine.location.city
        state = machine.location.state
      }
      
      citySlug = formatCitySlug(city, state)
    }
  }
  
  // Return the full URL path
  return `/${locale}/equipment-rental/location/${citySlug}/machines/${machine.id}`
}

/**
 * Generates the appropriate machine detail URL without locale prefix
 * Useful for components that don't have access to the locale
 * 
 * @param machine The machine object
 * @returns The URL path without locale prefix
 */
export function getMachineDetailUrlWithoutLocale(machine: Machine): string {
  let citySlug: string
  
  // Check if machine is buyItNowOnly (global machines are marked as such)
  if (machine.buyItNowOnly) {
    citySlug = 'lafayette-la'
  } else {
    // Check if machine is within Lafayette radius
    const coords = getMachineCoordinates(machine)
    
    if (!coords || !isWithinLafayetteRadius(coords.lat, coords.lon)) {
      // Machine is outside radius or location unknown - use Lafayette
      citySlug = 'lafayette-la'
    } else {
      // Machine is within radius - use actual location
      // Try different location formats in the machine object
      let city: string | undefined
      let state: string | undefined
      
      if (machine.location?.address?.city && machine.location?.address?.stateProvince) {
        city = machine.location.address.city
        state = machine.location.address.stateProvince
      } else if (machine.location?.city && machine.location?.state) {
        city = machine.location.city
        state = machine.location.state
      }
      
      citySlug = formatCitySlug(city, state)
    }
  }
  
  // Return the URL path without locale
  return `/equipment-rental/location/${citySlug}/machines/${machine.id}`
}

/**
 * Extracts city slug from a machine for consistent usage
 * @param machine The machine object
 * @returns The city slug (e.g., "lafayette-la")
 */
export function getMachineCitySlug(machine: Machine): string {
  // Check if machine is buyItNowOnly (global machines are marked as such)
  if (machine.buyItNowOnly) {
    return 'lafayette-la'
  }
  
  // Check if machine is within Lafayette radius
  const coords = getMachineCoordinates(machine)
  
  if (!coords || !isWithinLafayetteRadius(coords.lat, coords.lon)) {
    // Machine is outside radius or location unknown - use Lafayette
    return 'lafayette-la'
  }
  
  // Machine is within radius - use actual location
  let city: string | undefined
  let state: string | undefined
  
  if (machine.location?.address?.city && machine.location?.address?.stateProvince) {
    city = machine.location.address.city
    state = machine.location.address.stateProvince
  } else if (machine.location?.city && machine.location?.state) {
    city = machine.location.city
    state = machine.location.state
  }
  
  return formatCitySlug(city, state)
}