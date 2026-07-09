/** Canonical LeadEdge360 lead routes (P0 nav unify). */
export const LEADS_LIST_PATH = '/leadedge360/leads'

export const LEADS_TOUR_URL = `${LEADS_LIST_PATH}?tour=1`
export const LEADS_NEW_URL = `${LEADS_LIST_PATH}?new=1`

/**
 * @param {string} id
 */
export function leadDetailPath(id) {
  const leadId = String(id || '').trim()
  return leadId ? `${LEADS_LIST_PATH}/${encodeURIComponent(leadId)}` : LEADS_LIST_PATH
}

/**
 * Legacy /leads redirect target preserving query string.
 * @param {Record<string, string | string[] | undefined>} [searchParams]
 */
export function leadsListRedirectUrl(searchParams = {}) {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue
    if (Array.isArray(value)) value.forEach((v) => q.append(key, v))
    else q.set(key, value)
  }
  const qs = q.toString()
  return qs ? `${LEADS_LIST_PATH}?${qs}` : LEADS_LIST_PATH
}
