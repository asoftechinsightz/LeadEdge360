import axios from 'axios'
import { getGooglePlacesKey } from '../google-keys.js'

function getKey() {
  const key = getGooglePlacesKey()
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY missing — add to .env and restart app')
  return key
}

function parseGooglePlacesResponse(data, label) {
  const status = data?.status || 'UNKNOWN'
  if (status === 'OK' || status === 'ZERO_RESULTS') {
    return data.results || []
  }
  const msg = data?.error_message || status
  throw new Error(`${label} failed: ${msg}`)
}

export async function searchBusinessesNearby({
  keyword,
  lat,
  lng,
  radiusMeters,
}) {
  const key = getKey()
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'

  const { data } = await axios.get(url, {
    params: {
      keyword,
      location: `${lat},${lng}`,
      radius: radiusMeters,
      key,
    },
    timeout: 20000,
  })

  let results = parseGooglePlacesResponse(data, 'Nearby search')

  if (data.next_page_token) {
    await new Promise((r) => setTimeout(r, 2000))
    try {
      const { data: page2 } = await axios.get(url, {
        params: { pagetoken: data.next_page_token, key },
        timeout: 20000,
      })
      results = results.concat(page2.results || [])
    } catch {
      // second page optional
    }
  }

  return results
}

export async function searchBusinessesText({
  query,
  lat,
  lng,
  radiusMeters,
}) {
  const key = getKey()
  const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'

  const { data } = await axios.get(url, {
    params: {
      query,
      location: lat != null && lng != null ? `${lat},${lng}` : undefined,
      radius: radiusMeters,
      key,
    },
    timeout: 20000,
  })

  return parseGooglePlacesResponse(data, 'Text search')
}

/** @deprecated use searchBusinessesNearby */
export async function searchBusinesses(opts) {
  return searchBusinessesNearby(opts)
}

export async function getPlaceDetails(placeId) {
  if (!placeId || String(placeId).startsWith('meta:')) {
    return {}
  }

  const key = getKey()
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'

  const { data } = await axios.get(url, {
    params: {
      place_id: placeId,
      fields: 'formatted_phone_number,website,url,business_status,name,formatted_address,international_phone_number',
      key,
    },
    timeout: 15000,
  })

  if (data?.status && data.status !== 'OK') {
    return {}
  }

  return data.result || {}
}
