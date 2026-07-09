/** Geo Lead Finder — providers, industries, labels */

/** 10 high-intent sectors for Indian SME lead gen (aligned with lead-scoring weights) */
export const GEO_CRITICAL_INDUSTRIES = [
  { value: 'Real Estate', label: 'Real Estate', keywords: 'real estate property builder', leadWeight: 20 },
  { value: 'Healthcare', label: 'Healthcare & Hospitals', keywords: 'hospital clinic healthcare', leadWeight: 17 },
  { value: 'Dental Clinic', label: 'Dental Clinic', keywords: 'dental clinic dentist', leadWeight: 16 },
  { value: 'Restaurant & Cafe', label: 'Restaurant & Cafe', keywords: 'restaurant cafe food', leadWeight: 14 },
  { value: 'Retail Store', label: 'Retail Store', keywords: 'retail store shop', leadWeight: 10 },
  { value: 'Gym & Fitness', label: 'Gym & Fitness', keywords: 'gym fitness center', leadWeight: 14 },
  { value: 'Salon & Beauty', label: 'Salon & Beauty', keywords: 'salon spa beauty parlour', leadWeight: 12 },
  { value: 'Interior Design', label: 'Interior Design', keywords: 'interior designer modular kitchen', leadWeight: 18 },
  { value: 'Education & Coaching', label: 'Education & Coaching', keywords: 'coaching institute school tuition', leadWeight: 12 },
  { value: 'Manufacturing', label: 'Manufacturing', keywords: 'manufacturer factory industrial', leadWeight: 11 },
]

export const GEO_INDUSTRY_VALUES = GEO_CRITICAL_INDUSTRIES.map((i) => i.value)

export function resolveGeoIndustry(input) {
  const raw = String(input || '').trim()
  const hit = GEO_CRITICAL_INDUSTRIES.find(
    (i) => i.value.toLowerCase() === raw.toLowerCase() || i.label.toLowerCase() === raw.toLowerCase(),
  )
  return hit?.value || GEO_CRITICAL_INDUSTRIES[0].value
}

export function industrySearchKeywords(industry) {
  const hit = GEO_CRITICAL_INDUSTRIES.find((i) => i.value === industry)
  return hit?.keywords || industry
}

export const GEO_LEAD_SOURCES = {
  google_maps_nearby: {
    id: 'google_maps_nearby',
    label: 'Google Maps (Nearby)',
    description: 'Radius search around city centre',
  },
  google_places_text: {
    id: 'google_places_text',
    label: 'Google Places (Text)',
    description: 'Keyword search — different results than nearby',
  },
  meta_places: {
    id: 'meta_places',
    label: 'Meta (Facebook & Instagram)',
    description: 'Facebook Graph place search — requires META_ACCESS_TOKEN',
  },
}

/** Default: Google + Meta combined, deduped by contact hash */
export const DEFAULT_GEO_SOURCES = ['google_maps_nearby', 'google_places_text', 'meta_places']

export const GEO_SOURCE_LABELS = {
  google_maps_nearby: 'Google Maps',
  google_places_text: 'Google Places',
  google_maps: 'Google Maps',
  meta_places: 'Meta',
  meta: 'Meta',
}
