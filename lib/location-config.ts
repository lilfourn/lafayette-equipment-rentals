/**
 * Location configuration for Lafayette Equipment Rentals
 * Central source of truth for all location-related constants
 */

export const LAFAYETTE_LOCATION = {
  // Lafayette, LA coordinates
  latitude: 30.2241,
  longitude: -92.0198,
  city: 'Lafayette',
  state: 'LA',
  stateFullName: 'Louisiana',
  zipCode: '70506',
  address: '2865 Ambassador Caffery Pkwy, Ste 135',
  fullAddress: '2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506',
  
  // Business details
  businessName: 'Lafayette Equipment Rentals',
  phone: '(337) 234-5678',
  
  // Service radius in miles
  serviceRadiusMiles: 50,
} as const

/**
 * Helper function to calculate distance between two coordinates using Haversine formula
 * @param lat1 First latitude
 * @param lon1 First longitude
 * @param lat2 Second latitude
 * @param lon2 Second longitude
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check if coordinates are within Lafayette service radius
 * @param lat Latitude to check
 * @param lon Longitude to check
 * @param radiusMiles Optional custom radius (defaults to service radius)
 * @returns True if within radius
 */
export function isWithinLafayetteRadius(lat: number, lon: number, radiusMiles: number = LAFAYETTE_LOCATION.serviceRadiusMiles): boolean {
  const distance = calculateDistance(
    LAFAYETTE_LOCATION.latitude,
    LAFAYETTE_LOCATION.longitude,
    lat,
    lon
  )
  return distance <= radiusMiles
}

/**
 * Get machine coordinates from various possible formats
 * @param machine Machine object with location data
 * @returns Coordinates or null if not found
 */
export function getMachineCoordinates(machine: any): { lat: number; lon: number } | null {
  // Check Azure Search format: [longitude, latitude]
  if (machine.location?.point?.coordinates) {
    return {
      lon: machine.location.point.coordinates[0],
      lat: machine.location.point.coordinates[1]
    }
  }
  
  // Check direct lat/lon properties
  if (machine.location?.longitude && machine.location?.latitude) {
    return {
      lon: machine.location.longitude,
      lat: machine.location.latitude
    }
  }
  
  return null
}