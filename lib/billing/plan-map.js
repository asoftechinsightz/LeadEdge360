/**
 * Canonical plan ID mapping — Razorpay checkout IDs ↔ internal plan codes.
 */

export const RAZORPAY_TO_PLAN = {
  // V5 checkout IDs
  'retail-business': 'RETAIL_BUSINESS',
  'retail-enterprise': 'RETAIL_ENTERPRISE',
  'lead-business': 'LEAD_BUSINESS',
  'lead-enterprise': 'LEAD_ENTERPRISE',
  'business-suite': 'SUITE_BUSINESS',
  'enterprise-business-suite': 'SUITE_ENTERPRISE',
  // Legacy V4 aliases
  'retail-starter': 'RETAIL_BUSINESS',
  'retail-professional': 'RETAIL_BUSINESS',
  'lead-starter': 'LEAD_BUSINESS',
  'lead-growth': 'LEAD_BUSINESS',
  'lead-professional': 'LEAD_BUSINESS',
  'business-growth-suite': 'SUITE_BUSINESS',
  starter: 'LEAD_BUSINESS',
  growth: 'LEAD_BUSINESS',
  scale: 'LEAD_ENTERPRISE',
}

export const PLAN_ALIASES = {
  RETAIL_BUSINESS: 'RETAIL_BUSINESS',
  RETAIL_ENTERPRISE: 'RETAIL_ENTERPRISE',
  LEAD_BUSINESS: 'LEAD_BUSINESS',
  LEAD_ENTERPRISE: 'LEAD_ENTERPRISE',
  SUITE_BUSINESS: 'SUITE_BUSINESS',
  SUITE_ENTERPRISE: 'SUITE_ENTERPRISE',
  STARTER: 'LEAD_BUSINESS',
  GROWTH: 'LEAD_BUSINESS',
  BUSINESS_GROWTH: 'LEAD_BUSINESS',
  PROFESSIONAL: 'LEAD_BUSINESS',
  ENTERPRISE: 'LEAD_ENTERPRISE',
  SCALE: 'LEAD_ENTERPRISE',
  BUNDLE_GROWTH_SUITE: 'SUITE_BUSINESS',
  RETAIL_STARTER: 'RETAIL_BUSINESS',
  RETAIL_PROFESSIONAL: 'RETAIL_BUSINESS',
  LEAD_STARTER: 'LEAD_BUSINESS',
  LEAD_GROWTH: 'LEAD_BUSINESS',
  LEAD_PROFESSIONAL: 'LEAD_BUSINESS',
}

export function resolvePlanCode(raw) {
  if (!raw) return 'LEAD_BUSINESS'
  const lower = String(raw).toLowerCase()
  if (RAZORPAY_TO_PLAN[lower]) return RAZORPAY_TO_PLAN[lower]
  const upper = String(raw).toUpperCase()
  return PLAN_ALIASES[upper] || upper
}

export function razorpayPlanIdForCode(planCode) {
  const code = resolvePlanCode(planCode)
  if (code === 'RETAIL_BUSINESS') return 'retail-business'
  if (code === 'RETAIL_ENTERPRISE') return 'retail-enterprise'
  if (code === 'LEAD_BUSINESS') return 'lead-business'
  if (code === 'LEAD_ENTERPRISE') return 'lead-enterprise'
  if (code === 'SUITE_BUSINESS') return 'business-suite'
  return 'lead-business'
}
