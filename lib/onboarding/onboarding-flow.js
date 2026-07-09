/**
 * Mandatory 3-step LeadEdge360 onboarding for new trial orgs.
 * Step 1: Company name (+ industry)
 * Step 2: Import demo leads
 * Step 3: View AI score on Leads page
 */

import { LEADS_LIST_PATH } from '../leads/paths.js'

export { LEADS_LIST_PATH, LEADS_TOUR_URL } from '../leads/paths.js'

export const LEAD_ONBOARDING_STEPS = [
  {
    key: 'company_name',
    index: 1,
    title: 'Company name',
    description: 'Tell us your company name and industry so we can personalize your workspace.',
    path: '/onboarding',
  },
  {
    key: 'import_demo_leads',
    index: 2,
    title: 'Import demo leads',
    description: 'Load sample leads matched to your industry — see your pipeline in under a minute.',
    path: '/onboarding',
  },
  {
    key: 'view_ai_score',
    index: 3,
    title: 'View AI score',
    description: 'Open Leads and review AI-powered scores on your imported leads.',
    path: LEADS_LIST_PATH,
  },
]

export const LEAD_ONBOARDING_COOKIE = 'lead_onboarding_step'
export const LEAD_ONBOARDING_TRIAL_COOKIE = 'lead_onboarding_trial'
export const LEAD_ONBOARDING_COMPLETE_COOKIE = 'lead_onboarding_complete'

export const GATED_LEAD_PATHS = [
  '/dashboard',
  '/leadedge360/leads',
  '/leadedge360',
  '/opportunities',
  '/proposals',
  '/invoices',
  '/revenue',
  '/campaigns',
  '/analytics',
  '/growth',
  '/growth-audit',
]

export const ONBOARDING_ALLOWED_PATHS = [
  '/onboarding',
  '/splash',
  '/signin',
  '/signup',
  '/product-selection',
  '/settings',
  '/subscribe',
]

/**
 * @param {string} industry
 * @returns {string}
 */
export function normalizeLeadIndustry(industry) {
  const raw = String(industry || '').toLowerCase().trim()
  if (!raw) return 'general'
  if (/retail|kirana|pharma|pharmacy|store|shop|e-?commerce/.test(raw)) return 'retail'
  if (/health|clinic|hospital|medical|pharma/.test(raw)) return 'healthcare'
  if (/real\s*estate|property|builder|realtor/.test(raw)) return 'real_estate'
  if (/edu|school|college|training|coaching/.test(raw)) return 'education'
  if (/manufactur|factory|industrial|supply/.test(raw)) return 'manufacturing'
  if (/saas|software|tech|it\s|agency|marketing/.test(raw)) return 'saas'
  if (/hospitality|hotel|restaurant|travel/.test(raw)) return 'hospitality'
  if (/bfsi|bank|finance|insurance|fintech/.test(raw)) return 'bfsi'
  return 'general'
}

/**
 * @param {Record<string, unknown> | null | undefined} progress
 */
export function getLeadOnboardingState(progress) {
  const required = progress?.leadQuickSetupRequired === true
  const steps = progress?.leadQuickSetup || {}
  const companyName = steps.companyName === true
  const demoLeadsImported = steps.demoLeadsImported === true
  const aiScoreViewed = steps.aiScoreViewed === true
  const complete = steps.completed === true || (companyName && demoLeadsImported && aiScoreViewed)

  let currentStep = 1
  if (companyName && !demoLeadsImported) currentStep = 2
  else if (companyName && demoLeadsImported && !aiScoreViewed) currentStep = 3
  else if (complete) currentStep = 3

  return {
    required,
    complete,
    currentStep,
    companyName,
    demoLeadsImported,
    aiScoreViewed,
    percent: computeLeadOnboardingPercent({ companyName, demoLeadsImported, aiScoreViewed, complete }),
  }
}

/**
 * @param {{ companyName?: boolean, demoLeadsImported?: boolean, aiScoreViewed?: boolean, complete?: boolean }} steps
 */
export function computeLeadOnboardingPercent(steps) {
  if (steps.complete) return 100
  let done = 0
  if (steps.companyName) done += 1
  if (steps.demoLeadsImported) done += 1
  if (steps.aiScoreViewed) done += 1
  return Math.round((done / LEAD_ONBOARDING_STEPS.length) * 100)
}

/**
 * @param {Record<string, unknown> | null | undefined} progress
 */
export function isLeadOnboardingComplete(progress) {
  return getLeadOnboardingState(progress).complete || progress?.leadQuickSetupRequired !== true
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function isTrialLeadOrg(db, orgId) {
  const org = await db.collection('orgs').findOne({ id: orgId })
  if (!org) return false
  if (org.internalProduction || org.leadQuickSetupRequired === false) return false
  if (org.leadQuickSetupRequired === true) return true

  const sub = await db.collection('subscriptions').findOne({
    orgId,
    status: { $in: ['TRIAL', 'trialing', 'trial'] },
  })
  if (sub) return true

  return ['starter', 'trial'].includes(String(org.plan || '').toLowerCase())
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function loadLeadOnboardingProgress(db, orgId) {
  const progress = await db.collection('onboarding_progress').findOne({ orgId })
  const trial = await isTrialLeadOrg(db, orgId)
  if (!progress && trial) {
    return { orgId, leadQuickSetupRequired: true, leadQuickSetup: { completed: false } }
  }
  if (progress && trial && progress.leadQuickSetupRequired !== true) {
    return { ...progress, leadQuickSetupRequired: true }
  }
  return progress
}

/**
 * @param {import('next/server').NextResponse} response
 * @param {{ required?: boolean, currentStep?: number, complete?: boolean }} state
 */
export function attachLeadOnboardingCookies(response, state) {
  const step = state.complete ? '3' : String(state.currentStep || 0)
  response.cookies.set(LEAD_ONBOARDING_COOKIE, step, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
  response.cookies.set(LEAD_ONBOARDING_TRIAL_COOKIE, state.required && !state.complete ? '1' : '0', {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
  response.cookies.set(LEAD_ONBOARDING_COMPLETE_COOKIE, state.complete ? '1' : '0', {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function syncLeadOnboardingCookies(db, orgId) {
  const progress = await loadLeadOnboardingProgress(db, orgId)
  const state = getLeadOnboardingState(progress)
  return {
    required: state.required,
    complete: state.complete,
    currentStep: state.currentStep,
    cookieStep: state.complete ? '3' : String(state.currentStep || 0),
    trialFlag: state.required && !state.complete ? '1' : '0',
    completeFlag: state.complete ? '1' : '0',
  }
}

/**
 * @param {string} pathname
 */
export function isLeadOnboardingGatedPath(pathname) {
  const path = pathname.split('?')[0]
  return GATED_LEAD_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}

/**
 * @param {string} pathname
 */
export function isOnboardingExemptPath(pathname) {
  const path = pathname.split('?')[0]
  return ONBOARDING_ALLOWED_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}
