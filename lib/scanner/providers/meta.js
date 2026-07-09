import axios from 'axios'
import { industrySearchKeywords } from '../constants.js'
import { normalizeIndianPin } from '../pincode.js'

function getMetaToken() {
  return process.env.META_ACCESS_TOKEN
    || process.env.FACEBOOK_ACCESS_TOKEN
    || process.env.META_PAGE_ACCESS_TOKEN
    || ''
}

/**
 * Meta Graph API — place search (Facebook & Instagram business pages).
 * Requires META_ACCESS_TOKEN in .env (Facebook App + permissions).
 */
export async function searchMetaPlaces({ industry, city, state, pinCode, lat, lng, radiusMeters }) {
  const token = getMetaToken()
  if (!token) {
    return { places: [], warning: 'META_ACCESS_TOKEN not configured — Meta source skipped' }
  }

  const keywords = industrySearchKeywords(industry)
  const pin = normalizeIndianPin(pinCode)
  const location = pin ? `${pin} India` : [city, state, 'India'].filter(Boolean).join(' ')
  const query = `${keywords} ${location}`.trim()

  const url = 'https://graph.facebook.com/v21.0/search'
  const { data } = await axios.get(url, {
    params: {
      type: 'place',
      q: query,
      center: lat != null && lng != null ? `${lat},${lng}` : undefined,
      distance: Math.min(radiusMeters || 10000, 50000),
      fields: [
        'name',
        'location',
        'phone',
        'website',
        'link',
        'category',
        'overall_star_rating',
        'rating_count',
        'is_permanently_closed',
        'username',
      ].join(','),
      access_token: token,
      limit: 25,
    },
    timeout: 15000,
  })

  const places = (data?.data || []).map((page) => ({
    place_id: `meta:${page.id}`,
    name: page.name,
    formatted_address: [
      page.location?.street,
      page.location?.city,
      page.location?.state,
      page.location?.zip,
    ].filter(Boolean).join(', '),
    geometry: {
      location: {
        lat: page.location?.latitude,
        lng: page.location?.longitude,
      },
    },
    rating: page.overall_star_rating || 0,
    user_ratings_total: page.rating_count || 0,
    _meta: {
      phone: page.phone || '',
      website: page.website || page.link || '',
      metaUrl: page.link || (page.username ? `https://facebook.com/${page.username}` : ''),
      category: page.category || '',
      businessStatus: page.is_permanently_closed ? 'CLOSED_PERMANENTLY' : 'OPERATIONAL',
    },
  }))

  return { places, warning: null }
}

export function enrichMetaPlace(place, job, source) {
  const meta = place._meta || {}
  return {
    id: place.place_id,
    jobId: job.id,
    orgId: job.orgId,
    company: place.name || '',
    address: place.formatted_address || '',
    city: job.city,
    state: job.state,
    pinCode: job.pinCode || '',
    country: job.country || 'India',
    industry: job.industry,
    phone: meta.phone || '',
    website: meta.website || '',
    googleUrl: meta.metaUrl || '',
    metaUrl: meta.metaUrl || '',
    businessStatus: meta.businessStatus || '',
    rating: place.rating || 0,
    reviews: place.user_ratings_total || 0,
    placeId: place.place_id,
    source,
    category: meta.category || '',
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    createdAt: new Date().toISOString(),
  }
}
