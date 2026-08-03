/**
 * Unit tests for AEO client-side scoring formulas (no API / DB).
 * Self-contained for Node — does not import Next.js modules.
 * Run: npm run test:aeo
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const checklist = JSON.parse(
  readFileSync(join(root, 'config/aeo/readiness-checklist.json'), 'utf8')
)
const defaults = JSON.parse(
  readFileSync(join(root, 'config/aeo/defaults.json'), 'utf8')
)

const FAQ_TARGET = defaults.faqTarget ?? 5
const DEFAULT_TERRITORIES = defaults.defaultTerritories ?? []

function googleLeadCount(kpis) {
  const google = (kpis?.bySource || []).find((s) => s.name === 'google')
  return google?.value ?? 0
}

function evaluateChecklistItem(item, profile, kpis) {
  if (item.kpiField === 'googleLeads') {
    return googleLeadCount(kpis) >= (item.minValue ?? 1)
  }
  const value = profile[item.field]
  if (item.minLength != null) return String(value || '').length >= item.minLength
  if (item.minCount != null) return Array.isArray(value) && value.length >= item.minCount
  if (item.required) {
    if (item.field === 'whatsappConfigured') return Boolean(profile.whatsappConfigured)
    return Boolean(value && String(value).trim())
  }
  return false
}

function businessCompletenessPct(profile, kpis) {
  const items = checklist.items || []
  const totalWeight = items.reduce((s, i) => s + (i.weight || 0), 0)
  if (!totalWeight) return 0
  const doneWeight = items.reduce(
    (s, item) => s + (evaluateChecklistItem(item, profile, kpis) ? item.weight || 0 : 0),
    0
  )
  return Math.round((doneWeight / totalWeight) * 100)
}

function faqReadinessPct(profile) {
  const count = (profile?.faqs || []).length
  return Math.min(100, Math.round((count / FAQ_TARGET) * 100))
}

function localVisibilityPct(profile, kpis) {
  const targets = profile?.serviceAreas?.length ? profile.serviceAreas : DEFAULT_TERRITORIES
  if (!targets.length) return 0
  const byTerr = kpis?.byTerritory || []
  const active = targets.filter((area) => {
    const row = byTerr.find((t) => t.name === area)
    return row && row.leads > 0
  }).length
  return Math.round((active / targets.length) * 100)
}

function reviewHealthPct(profile) {
  const pending = Number(profile?.reviews?.pendingReplies || 0)
  const rating = Number(profile?.reviews?.averageRating || 0)
  if (pending > 0) return Math.max(0, 100 - pending * 20)
  if (rating >= 4) return 100
  if (rating > 0) return Math.round((rating / 5) * 100)
  return 50
}

function computeAeoScore(profile, kpis) {
  const completeness = businessCompletenessPct(profile, kpis)
  const faqPct = faqReadinessPct(profile)
  const localPct = localVisibilityPct(profile, kpis)
  const reviewPct = reviewHealthPct(profile)
  const score = Math.round(
    0.35 * completeness + 0.25 * faqPct + 0.25 * localPct + 0.15 * reviewPct
  )
  return { score: Math.max(0, Math.min(100, score)), completeness, faqPct, localPct, reviewPct }
}

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) passed++
  else {
    failed++
    console.error('FAIL:', msg)
  }
}

const kpis = {
  total: 10,
  byTerritory: [
    { name: 'Bengaluru', leads: 5 },
    { name: 'Mumbai', leads: 0 },
  ],
  bySource: [{ name: 'google', value: 2 }],
}

const fullProfile = {
  businessName: 'Test Co',
  category: 'SaaS',
  descriptionLong: 'A'.repeat(160),
  serviceAreas: ['Bengaluru', 'Mumbai', 'Pune'],
  phone: '+919999999999',
  website: 'https://example.com',
  whatsappConfigured: true,
  keywords: ['demo', 'pricing', 'quote', 'buy', 'trial'],
  faqs: Array.from({ length: 5 }, (_, i) => ({ question: `Q${i}`, answer: `A${i}` })),
  reviews: { count: 10, averageRating: 4.5, pendingReplies: 0 },
}

assert(businessCompletenessPct(fullProfile, kpis) >= 80, 'completeness high for full profile')
assert(faqReadinessPct(fullProfile) === 100, 'faq readiness 100%')
assert(localVisibilityPct(fullProfile, kpis) === 33, 'local visibility 1/3 territories')
assert(reviewHealthPct(fullProfile) === 100, 'review health 100%')

const score = computeAeoScore(fullProfile, kpis)
assert(score.score >= 70 && score.score <= 100, 'aeo score range')

const emptyProfile = { reviews: { pendingReplies: 0, averageRating: 0 } }
const emptyScore = computeAeoScore(emptyProfile, kpis)
assert(emptyScore.score < score.score, 'empty profile lower score')

assert(checklist.items.length >= 5, 'checklist config loaded')
assert(DEFAULT_TERRITORIES.length >= 3, 'default territories loaded')

// ─── E-003 preferences merge (server profile) ───
const {
  mergeUserPreferences,
  normalizeAeoProfile,
  isAeoProfileEmpty,
  validateAeoProfile,
  isAeoServerProfileEnabled,
} = await import('../lib/aeo/preferences-merge.js')

assert(!isAeoServerProfileEnabled(), 'AEO_SERVER_PROFILE off by default')

const merged = mergeUserPreferences(
  { notifications: { push: true } },
  { aeoProfile: { businessName: 'Merge Co', category: 'Retail' } }
)
assert(merged.notifications?.push === true, 'preferences merge keeps notifications')
assert(merged.aeoProfile?.businessName === 'Merge Co', 'preferences merge sets aeoProfile')

const deepMerged = mergeUserPreferences(
  { aeoProfile: { businessName: 'A', keywords: ['old'] } },
  { aeoProfile: { keywords: ['new'], faqs: [{ question: 'Q', answer: 'A' }] } }
)
assert(deepMerged.aeoProfile.businessName === 'A', 'deep merge keeps businessName')
assert(deepMerged.aeoProfile.keywords[0] === 'new', 'deep merge patches keywords')
assert(deepMerged.aeoProfile.faqs.length === 1, 'deep merge adds faqs')

const badUrl = mergeUserPreferences({}, { aeoProfile: { website: 'not-a-url' } })
assert(badUrl.error, 'invalid URL rejected')

const empty = normalizeAeoProfile(null)
assert(isAeoProfileEmpty(empty), 'empty normalized profile is empty')
assert(validateAeoProfile({ businessName: 'X', category: 'Y' }).ok, 'minimal profile valid')

console.log(`AEO compute tests: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
