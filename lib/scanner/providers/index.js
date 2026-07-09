import { DEFAULT_GEO_SOURCES } from '../constants.js'
import { normalizeIndianPin } from '../pincode.js'
import { searchBusinessesNearby, searchBusinessesText } from './google.js'
import { searchMetaPlaces } from './meta.js'

async function runNearby(job, geo) {
  return searchBusinessesNearby({
    keyword: job.industry,
    lat: geo.lat,
    lng: geo.lng,
    radiusMeters: (job.radiusKm || 25) * 1000,
  })
}

async function runText(job, geo) {
  const pin = normalizeIndianPin(job.pinCode)
  const query = pin
    ? `${job.industry} ${pin} India`
    : `${job.industry} ${job.city || ''} ${job.state || ''} India`.trim()

  return searchBusinessesText({
    query,
    lat: geo.lat,
    lng: geo.lng,
    radiusMeters: (job.radiusKm || 25) * 1000,
  })
}

async function runMeta(job, geo) {
  const { places, warning } = await searchMetaPlaces({
    industry: job.industry,
    city: job.city,
    state: job.state,
    pinCode: job.pinCode,
    lat: geo.lat,
    lng: geo.lng,
    radiusMeters: (job.radiusKm || 25) * 1000,
  })
  return { places, warning }
}

const PROVIDERS = {
  google_maps_nearby: runNearby,
  google_maps: runNearby,
  google_places_text: runText,
  meta_places: runMeta,
}

/**
 * Run selected providers and dedupe by place_id / meta id across sources.
 */
export async function searchAllProviders(job, geo) {
  const sources = (job.sources?.length ? job.sources : DEFAULT_GEO_SOURCES)
    .filter((s) => PROVIDERS[s])

  const seenPlaceIds = new Set()
  const combined = []
  const warnings = []

  for (const sourceId of sources) {
    const result = await PROVIDERS[sourceId](job, geo)
    const places = Array.isArray(result) ? result : result.places || []
    if (result?.warning) warnings.push(result.warning)

    for (const place of places) {
      const placeId = place.place_id
      if (!placeId || seenPlaceIds.has(placeId)) continue
      seenPlaceIds.add(placeId)
      combined.push({ place, source: sourceId })
    }
  }

  return { places: combined, warnings }
}

export { enrichMetaPlace } from './meta.js'
