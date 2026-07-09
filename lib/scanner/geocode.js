import { buildPinCentricAddress, normalizeIndianPin } from './pincode.js'
import { getGoogleMapsKey } from './google-keys.js'

const GOOGLE_GEOCODE_URL =
  'https://maps.googleapis.com/maps/api/geocode/json'

export async function geocodeLocation(city, state, { pinCode, country, district } = {}) {
  const apiKey = getGoogleMapsKey()

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY missing — add to .env and restart app')
  }

  const pin = normalizeIndianPin(pinCode)
  const address = pin
    ? buildPinCentricAddress(pin, { country: country || 'India' })
    : [district, city, state, country || 'India'].filter(Boolean).join(', ')

  if (!address) {
    throw new Error('PIN code or city/state required for geocoding')
  }

  const url =
    `${GOOGLE_GEOCODE_URL}?address=` +
    encodeURIComponent(address) +
    `&key=${apiKey}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Geocode request failed (${response.status})`,
    )
  }

  const data = await response.json()

  if (
    data.status !== 'OK' ||
    !data.results ||
    !data.results.length
  ) {
    const detail = data.error_message || data.status || 'unknown'
    throw new Error(
      `Geocode failed (${detail}) — check GOOGLE_MAPS_API_KEY and enable Geocoding API`,
    )
  }

  const location =
    data.results[0].geometry.location

  return {
    lat: location.lat,
    lng: location.lng,
    address,
    pinCode: pin || null,
  }
}
