/**
 * LOCATION & GEOLOCATION UTILITIES
 * 
 * Provides:
 * - Haversine distance calculation
 * - Nearest hub detection
 * - Location validation
 * 
 * Production-ready for mobile-first apps
 */

/**
 * Haversine formula: Calculate distance between two coordinates
 * @param {number} lat1 - User latitude
 * @param {number} lon1 - User longitude
 * @param {number} lat2 - Hub latitude
 * @param {number} lon2 - Hub longitude
 * @returns {number} Distance in kilometers (rounded to 2 decimals)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimals
}

/**
 * Validate geographic coordinates
 * @param {number} latitude - Latitude (-90 to 90)
 * @param {number} longitude - Longitude (-180 to 180)
 * @returns {boolean} True if valid coordinates
 */
export function isValidCoordinates(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

/**
 * Find nearest hub from user location
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {array} hubs - Array of hub objects with {hub_id, hub_name, latitude, longitude}
 * @returns {object} Nearest hub with distance, or null if no valid hubs
 */
export function findNearestHub(userLat, userLon, hubs) {
  if (!Array.isArray(hubs) || hubs.length === 0) {
    return null;
  }
  
  // Filter hubs with valid coordinates
  const validHubs = hubs.filter(hub => 
    hub.latitude !== null && hub.longitude !== null &&
    isValidCoordinates(hub.latitude, hub.longitude)
  );
  
  if (validHubs.length === 0) {
    return null;
  }
  
  // Calculate distance to each hub
  const hubsWithDistance = validHubs.map(hub => ({
    ...hub,
    distance_km: calculateDistance(userLat, userLon, hub.latitude, hub.longitude)
  }));
  
  // Sort by distance and return nearest
  hubsWithDistance.sort((a, b) => a.distance_km - b.distance_km);
  return hubsWithDistance[0];
}

/**
 * Get hubs within radius (for nearby options)
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {array} hubs - Array of hub objects
 * @param {number} radiusKm - Search radius in kilometers (default: 10)
 * @returns {array} Hubs within radius, sorted by distance
 */
export function getHubsWithinRadius(userLat, userLon, hubs, radiusKm = 10) {
  if (!Array.isArray(hubs) || hubs.length === 0) {
    return [];
  }
  
  const validHubs = hubs.filter(hub => 
    hub.latitude !== null && hub.longitude !== null &&
    isValidCoordinates(hub.latitude, hub.longitude)
  );
  
  const nearbyHubs = validHubs
    .map(hub => ({
      ...hub,
      distance_km: calculateDistance(userLat, userLon, hub.latitude, hub.longitude)
    }))
    .filter(hub => hub.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
  
  return nearbyHubs;
}

/**
 * Format location display string
 * @param {object} hub - Hub object with location and distance_km
 * @returns {string} Formatted location string
 */
export function formatLocationDisplay(hub) {
  if (!hub) return 'Location unavailable';
  const distance = hub.distance_km ? `${hub.distance_km} km away` : 'Distance unknown';
  return `${hub.hub_name || 'Hub'} (${distance})`;
}

/**
 * Simulate location for testing (Indian cities)
 * @param {string} cityName - City name (delhi, mumbai, bangalore, etc)
 * @returns {object} Mock coordinates {latitude, longitude}
 */
export function getMockLocationForCity(cityName) {
  const cities = {
    'delhi': { latitude: 28.6139, longitude: 77.2090 },
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'bhopal': { latitude: 23.1815, longitude: 79.9864 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'pune': { latitude: 18.5204, longitude: 73.8567 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 }
  };
  
  return cities[cityName.toLowerCase()] || null;
}
