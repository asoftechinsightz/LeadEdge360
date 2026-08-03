/**
 * Server-side AEO preferences merge + validation (E-003).
 * Used by PATCH /api/users/me — no new routes or collections.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const fieldsConfig = JSON.parse(
  readFileSync(join(root, 'config/aeo/business-profile-fields.json'), 'utf8')
)

export function isAeoServerProfileEnabled() {
  return process.env.AEO_SERVER_PROFILE === 'true'
}

function emptyAeoProfile() {
  return {
    businessName: '',
    category: '',
    descriptionShort: '',
    descriptionLong: '',
    serviceAreas: [],
    phone: '',
    website: '',
    hours: '',
    gbpUrl: '',
    keywords: [],
    faqs: [],
    whatsappConfigured: false,
    reviews: {
      count: 0,
      averageRating: 0,
      pendingReplies: 0,
      pendingTexts: [],
    },
  }
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function deepMergeObjects(base, patch) {
  const out = { ...base }
  for (const [key, val] of Object.entries(patch || {})) {
    if (val === undefined) continue
    if (isPlainObject(val) && isPlainObject(out[key])) {
      out[key] = deepMergeObjects(out[key], val)
    } else {
      out[key] = val
    }
  }
  return out
}

export function normalizeAeoProfile(profile) {
  const base = emptyAeoProfile()
  const merged = { ...base, ...(profile || {}) }
  merged.reviews = { ...base.reviews, ...(merged.reviews || {}) }
  merged.serviceAreas = Array.isArray(merged.serviceAreas) ? merged.serviceAreas : []
  merged.keywords = Array.isArray(merged.keywords) ? merged.keywords : []
  merged.faqs = Array.isArray(merged.faqs) ? merged.faqs : []
  return merged
}

export function isAeoProfileEmpty(profile) {
  const p = normalizeAeoProfile(profile)
  return (
    !String(p.businessName || '').trim()
    && !String(p.category || '').trim()
    && (p.faqs?.length || 0) === 0
    && (p.keywords?.length || 0) === 0
    && (p.serviceAreas?.length || 0) === 0
  )
}

export function validateAeoProfile(profile) {
  const errors = []
  const p = normalizeAeoProfile(profile)

  for (const field of fieldsConfig.fields || []) {
    const val = p[field.key]
    if (field.maxLength != null && val && String(val).length > field.maxLength) {
      errors.push(`${field.key} exceeds max length ${field.maxLength}`)
    }
    if (field.type === 'url' && val && String(val).trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(String(val))
      } catch {
        errors.push(`${field.key} must be a valid URL`)
      }
    }
  }

  if (p.reviews?.averageRating != null) {
    const r = Number(p.reviews.averageRating)
    if (r < 0 || r > 5) errors.push('reviews.averageRating must be between 0 and 5')
  }

  return errors.length ? { ok: false, errors } : { ok: true }
}

/**
 * Deep-merge preferences patch into existing document preferences.
 * Returns merged preferences or { error, errors }.
 */
export function mergeUserPreferences(existing, patch) {
  if (!patch || typeof patch !== 'object') {
    return { error: 'preferences must be an object' }
  }

  const base = existing && typeof existing === 'object' ? existing : {}
  const merged = deepMergeObjects(base, patch)

  if (patch.aeoProfile !== undefined) {
    merged.aeoProfile = normalizeAeoProfile(
      deepMergeObjects(base.aeoProfile || {}, patch.aeoProfile || {})
    )
    const validation = validateAeoProfile(merged.aeoProfile)
    if (!validation.ok) return { error: 'Invalid aeoProfile', errors: validation.errors }
  }

  if (patch.aeoChecklistState !== undefined) {
    if (!isPlainObject(patch.aeoChecklistState)) {
      return { error: 'aeoChecklistState must be an object' }
    }
    merged.aeoChecklistState = deepMergeObjects(base.aeoChecklistState || {}, patch.aeoChecklistState)
  }

  return merged
}
