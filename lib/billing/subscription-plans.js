/**
 * Razorpay checkout plans — derived from PRICING_V5 (marketing single source).
 * Env overrides: RAZORPAY_PLAN_<PLAN_CODE> e.g. RAZORPAY_PLAN_LEAD_STARTER=plan_xxx
 */
import { PRICING_V5 } from '@/lib/marketing-content'

function parseInr(price) {
  if (!price || price === 'Custom') return null
  return Number(String(price).replace(/[₹,\s]/g, '')) || null
}

function envPlanId(planCode) {
  const key = `RAZORPAY_PLAN_${String(planCode).replace(/-/g, '_').toUpperCase()}`
  return process.env[key] || null
}

function tierToPlan({ tier, productKey, productLabel, planCodePrefix }) {
  const planCode = `${planCodePrefix}_${tier.id.toUpperCase()}`
  return {
    id: `${productKey}-${tier.id}`,
    planCode,
    product: productKey,
    productLabel,
    name: tier.name,
    price: parseInr(tier.price),
    setupPrice: tier.setupFee ? parseInr(tier.setupFee) : null,
    setupLabel: tier.setupLabel || null,
    currency: 'INR',
    interval: 'month',
    custom: tier.price === 'Custom',
    highlight: Boolean(tier.highlight),
    badge: tier.badge || null,
    idealFor: tier.idealFor,
    features: tier.features,
    razorpayPlanId: envPlanId(planCode),
  }
}

export function buildSubscriptionPlans() {
  const plans = []

  for (const tier of PRICING_V5.retailedge360.tiers) {
    plans.push(tierToPlan({ tier, productKey: 'retail', productLabel: 'RetailEdge360', planCodePrefix: 'RETAIL' }))
  }

  for (const tier of PRICING_V5.leadedge360.tiers) {
    plans.push(tierToPlan({ tier, productKey: 'lead', productLabel: 'LeadEdge360', planCodePrefix: 'LEAD' }))
  }

  for (const bundle of PRICING_V5.bundles) {
    const price = parseInr(bundle.price)
    plans.push({
      id: bundle.id,
      planCode: bundle.id === 'business-suite' ? 'SUITE_BUSINESS' : 'SUITE_ENTERPRISE',
      product: 'bundle',
      productLabel: 'Business Suite',
      name: bundle.name,
      price,
      setupPrice: bundle.setupFee ? parseInr(bundle.setupFee) : null,
      setupLabel: bundle.setupLabel || null,
      currency: 'INR',
      interval: 'month',
      custom: bundle.price === 'Custom',
      highlight: Boolean(bundle.highlight),
      badge: bundle.badge || null,
      idealFor: bundle.idealFor,
      features: [...(bundle.includes || []), ...(bundle.features || [])],
      razorpayPlanId: envPlanId(bundle.id === 'business-suite' ? 'SUITE_BUSINESS' : 'SUITE_ENTERPRISE'),
    })
  }

  return plans
}

export const LEGACY_PLAN_ALIASES = [
  { id: 'starter', planCode: 'LEAD_BUSINESS', product: 'lead', productLabel: 'LeadEdge360', name: 'Business (legacy id)', price: 14999, currency: 'INR', interval: 'month', custom: false, features: ['AI CRM'], legacy: true },
  { id: 'growth', planCode: 'LEAD_BUSINESS', product: 'lead', productLabel: 'LeadEdge360', name: 'Growth (legacy id)', price: 14999, currency: 'INR', interval: 'month', custom: false, features: ['AI CRM'], legacy: true },
  { id: 'scale', planCode: 'LEAD_ENTERPRISE', product: 'lead', productLabel: 'LeadEdge360', name: 'Enterprise (legacy id)', price: 24999, currency: 'INR', interval: 'month', custom: false, features: ['Enterprise CRM'], legacy: true },
]

export const SUBSCRIPTION_PLANS = buildSubscriptionPlans()

export function allCheckoutPlans() {
  return [...SUBSCRIPTION_PLANS, ...LEGACY_PLAN_ALIASES]
}

export function findCheckoutPlan(planId) {
  return allCheckoutPlans().find((p) => p.id === planId) || null
}

export function productsForPlan(plan) {
  if (!plan) return ['leadedge360']
  if (plan.product === 'retail') return ['retailedge360']
  if (plan.product === 'lead') return ['leadedge360']
  if (plan.product === 'bundle') return ['retailedge360', 'leadedge360']
  return ['leadedge360']
}
