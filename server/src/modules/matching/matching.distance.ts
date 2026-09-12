/**
 * Haversine formula for calculating great-circle distance between two points on a sphere.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

// Known regional city pair fallbacks (Gujarat industrial belt) if coordinates are null
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  AHMEDABAD: { lat: 22.9583, lon: 72.6369 },
  VADODARA: { lat: 22.411, lon: 73.089 },
  SURAT: { lat: 21.1167, lon: 72.65 },
  DAHEJ: { lat: 21.7118, lon: 72.5312 },
  GANDHINAGAR: { lat: 23.2156, lon: 72.6369 },
  BHARUCH: { lat: 21.7051, lon: 72.9959 },
  RAJKOT: { lat: 22.3039, lon: 70.8022 },
  MUMBAI: { lat: 19.076, lon: 72.8777 },
};

export function getEstimatedGeographicDistance(
  lat1?: number | null,
  lon1?: number | null,
  city1?: string,
  lat2?: number | null,
  lon2?: number | null,
  city2?: string
): { distanceKm: number; isFallback: boolean } {
  // 1. Direct coordinates available
  if (
    lat1 != null &&
    lon1 != null &&
    lat2 != null &&
    lon2 != null &&
    !isNaN(lat1) &&
    !isNaN(lon1) &&
    !isNaN(lat2) &&
    !isNaN(lon2)
  ) {
    return {
      distanceKm: calculateHaversineDistance(lat1, lon1, lat2, lon2),
      isFallback: false,
    };
  }

  // 2. Lookup city coordinates
  const c1 = city1 ? CITY_COORDINATES[city1.trim().toUpperCase()] : null;
  const c2 = city2 ? CITY_COORDINATES[city2.trim().toUpperCase()] : null;

  if (c1 && c2) {
    return {
      distanceKm: calculateHaversineDistance(c1.lat, c1.lon, c2.lat, c2.lon),
      isFallback: true,
    };
  }

  // 3. Regional default fallback
  return {
    distanceKm: 145.0,
    isFallback: true,
  };
}
