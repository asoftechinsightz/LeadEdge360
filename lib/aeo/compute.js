import checklistConfig from '../../config/aeo/readiness-checklist.json'
import defaultsConfig from '../../config/aeo/defaults.json'

export const FAQ_TARGET = defaultsConfig.faqTarget ?? 5
export const DEFAULT_TERRITORIES = defaultsConfig.defaultTerritories ?? []

export function emptyAeoProfile() {
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

function googleLeadCount(kpis) {
  const google = (kpis?.bySource || []).find((s) => s.name === 'google')
  return google?.value ?? 0
}

export function evaluateChecklistItem(item, profile, kpis) {
  const p = profile || emptyAeoProfile()

  if (item.kpiField === 'googleLeads') {
    const count = googleLeadCount(kpis)
    return count >= (item.minValue ?? 1)
  }

  const field = item.field
  if (!field) return false

  const value = p[field]

  if (item.minLength != null) {
    return String(value || '').length >= item.minLength
  }
  if (item.minCount != null) {
    return Array.isArray(value) && value.length >= item.minCount
  }
  if (item.required) {
    if (field === 'whatsappConfigured') return Boolean(p.whatsappConfigured)
    return Boolean(value && String(value).trim())
  }
  return false
}

export function businessCompletenessPct(profile, kpis) {
  const items = checklistConfig.items || []
  const totalWeight = items.reduce((s, i) => s + (i.weight || 0), 0)
  if (!totalWeight) return 0

  const doneWeight = items.reduce((s, item) => {
    return s + (evaluateChecklistItem(item, profile, kpis) ? item.weight || 0 : 0)
  }, 0)

  return Math.round((doneWeight / totalWeight) * 100)
}

export function faqReadinessPct(profile) {
  const count = (profile?.faqs || []).length
  return Math.min(100, Math.round((count / FAQ_TARGET) * 100))
}

export function localVisibilityPct(profile, kpis) {
  const targets = profile?.serviceAreas?.length
    ? profile.serviceAreas
    : DEFAULT_TERRITORIES

  if (!targets.length) return 0

  const byTerr = kpis?.byTerritory || []
  const active = targets.filter((area) => {
    const row = byTerr.find((t) => t.name === area)
    return row && row.leads > 0
  }).length

  return Math.round((active / targets.length) * 100)
}

export function reviewHealthPct(profile) {
  const reviews = profile?.reviews || {}
  const pending = Number(reviews.pendingReplies || 0)
  const rating = Number(reviews.averageRating || 0)

  if (pending > 0) return Math.max(0, 100 - pending * 20)
  if (rating >= 4) return 100
  if (rating > 0) return Math.round((rating / 5) * 100)
  return 50
}

export function reviewHealthLabel(profile) {
  const pending = Number(profile?.reviews?.pendingReplies || 0)
  if (pending > 0) return `${pending} pending ${pending === 1 ? 'reply' : 'replies'}`
  const rating = profile?.reviews?.averageRating
  if (rating > 0) return `avg ${rating.toFixed(1)} rating`
  return 'no pending replies'
}

export function computeAeoScore(profile, kpis) {
  const completeness = businessCompletenessPct(profile, kpis)
  const faqPct = faqReadinessPct(profile)
  const localPct = localVisibilityPct(profile, kpis)
  const reviewPct = reviewHealthPct(profile)

  const score = Math.round(
    0.35 * completeness + 0.25 * faqPct + 0.25 * localPct + 0.15 * reviewPct
  )

  return {
    score: Math.max(0, Math.min(100, score)),
    completeness,
    faqPct,
    localPct,
    reviewPct,
  }
}

export function checklistProgress(profile, kpis) {
  return (checklistConfig.items || []).map((item) => ({
    id: item.id,
    label: item.label,
    done: evaluateChecklistItem(item, profile, kpis),
    weight: item.weight,
  }))
}
