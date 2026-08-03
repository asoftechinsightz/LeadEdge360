import { emptyAeoProfile } from '@/lib/aeo/compute'

export const AEO_PROFILE_STORAGE_KEY = 'leadedge_aeoProfile'
export const AEO_MERGE_DONE_KEY = 'leadedge_aeoProfile_merged'

export function loadAeoProfileFromSession() {
  if (typeof window === 'undefined') return emptyAeoProfile()
  try {
    const raw = sessionStorage.getItem(AEO_PROFILE_STORAGE_KEY)
    if (!raw) return emptyAeoProfile()
    return normalizeClientProfile(JSON.parse(raw))
  } catch {
    return emptyAeoProfile()
  }
}

/** Session-only load — used when AEO_SERVER_PROFILE is off or as fallback. */
export function loadAeoProfile() {
  return loadAeoProfileFromSession()
}

export function saveAeoProfile(profile) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(AEO_PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function clearAeoSessionStorage() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(AEO_PROFILE_STORAGE_KEY)
  sessionStorage.removeItem(AEO_MERGE_DONE_KEY)
}

export function markAeoSessionMerged() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(AEO_MERGE_DONE_KEY, '1')
}

export function wasAeoSessionMerged() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(AEO_MERGE_DONE_KEY) === '1'
}

export function normalizeClientProfile(profile) {
  const base = emptyAeoProfile()
  const merged = { ...base, ...(profile || {}) }
  merged.reviews = { ...base.reviews, ...(merged.reviews || {}) }
  merged.serviceAreas = Array.isArray(merged.serviceAreas) ? merged.serviceAreas : []
  merged.keywords = Array.isArray(merged.keywords) ? merged.keywords : []
  merged.faqs = Array.isArray(merged.faqs) ? merged.faqs : []
  return merged
}

export function isClientProfileEmpty(profile) {
  const p = normalizeClientProfile(profile)
  return (
    !String(p.businessName || '').trim()
    && !String(p.category || '').trim()
    && (p.faqs?.length || 0) === 0
    && (p.keywords?.length || 0) === 0
    && (p.serviceAreas?.length || 0) === 0
  )
}

/**
 * One-time merge: sessionStorage → server profile when server empty (PO-D2).
 */
export function mergeSessionProfileOnce(serverProfile) {
  const normalized = normalizeClientProfile(serverProfile)
  if (typeof window === 'undefined') return normalized
  if (wasAeoSessionMerged()) return normalized

  const session = loadAeoProfileFromSession()
  const serverEmpty = isClientProfileEmpty(normalized)
  const sessionHasData = !isClientProfileEmpty(session)

  if (serverEmpty && sessionHasData) {
    markAeoSessionMerged()
    return normalizeClientProfile({ ...normalized, ...session })
  }

  markAeoSessionMerged()
  return normalized
}

export function profileFromUserPreferences(preferences) {
  if (!preferences?.aeoProfile) return emptyAeoProfile()
  return normalizeClientProfile(preferences.aeoProfile)
}

export async function fetchAuthMe() {
  try {
    const r = await fetch('/api/auth/me')
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

/**
 * Load profile per E-003: server-first when flag on, session fallback.
 */
export async function hydrateAeoProfileFromApi() {
  const me = await fetchAuthMe()
  const serverEnabled = me?.features?.aeoServerProfile === true
  const canServerSave = me?.features?.webJwtBridge === true

  if (!serverEnabled) {
    return {
      profile: loadAeoProfileFromSession(),
      serverEnabled: false,
      canServerSave: false,
      mergedFromSession: false,
      isDemo: me?.isDemo ?? true,
    }
  }

  const fromServer = profileFromUserPreferences(me?.user?.preferences)
  const sessionSnap = loadAeoProfileFromSession()
  const serverWasEmpty = isClientProfileEmpty(fromServer)
  const profile = mergeSessionProfileOnce(fromServer)
  const mergedFromSession = serverWasEmpty && !isClientProfileEmpty(sessionSnap)

  return {
    profile,
    serverEnabled: true,
    canServerSave,
    mergedFromSession,
    isDemo: me?.isDemo ?? false,
    user: me?.user,
  }
}

export async function saveAeoProfileToServer(profile) {
  const r = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: {
        aeoProfile: normalizeClientProfile(profile),
      },
    }),
  })
  const body = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, body }
}

export function parseKeywordsInput(input) {
  return String(input || '')
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
