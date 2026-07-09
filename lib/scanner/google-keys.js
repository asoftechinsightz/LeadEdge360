/** Shared Google API key helpers for Geo Lead Finder */

export function getGoogleMapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY
    || process.env.GOOGLE_PLACES_API_KEY
    || process.env.GOOGLE_API_KEY
    || ''
}

export function getGooglePlacesKey() {
  return process.env.GOOGLE_PLACES_API_KEY
    || process.env.GOOGLE_MAPS_API_KEY
    || process.env.GOOGLE_API_KEY
    || ''
}

export function getGoogleKeysStatus() {
  const maps = Boolean(getGoogleMapsKey())
  const places = Boolean(getGooglePlacesKey())
  return {
    maps,
    places,
    ready: maps && places,
    mapsEnv: process.env.GOOGLE_MAPS_API_KEY ? 'GOOGLE_MAPS_API_KEY' : (process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : null),
    placesEnv: process.env.GOOGLE_PLACES_API_KEY ? 'GOOGLE_PLACES_API_KEY' : (process.env.GOOGLE_MAPS_API_KEY ? 'GOOGLE_MAPS_API_KEY (shared)' : null),
  }
}
