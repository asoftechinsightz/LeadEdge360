import crypto from 'crypto'
import { resolvePlanCode } from '@/lib/billing/plan-map'
import { SUBSCRIPTION_PLANS, allCheckoutPlans } from '@/lib/billing/subscription-plans'
import { getRazorpayCredentialsForOrg } from '@/lib/integrations/razorpay-tenant.js'

let Razorpay = null
try { Razorpay = require('razorpay') } catch {}

export const RZP_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
)

export function getRazorpay() {
  if (!RZP_CONFIGURED || !Razorpay) return null
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

/** Tenant-aware Razorpay client (integration credentials or platform env). */
export async function getRazorpayForTenant(orgId) {
  const creds = await getRazorpayCredentialsForOrg(orgId)
  if (!creds || !Razorpay) return null
  return new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret })
}

export function verifyCheckoutSignature({ order_id, payment_id, signature }, keySecret) {
  const secret = keySecret || process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${order_id}|${payment_id}`)
    .digest('hex')
  return expected === signature
}

export function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}

export const PLANS = allCheckoutPlans()

export { SUBSCRIPTION_PLANS, allCheckoutPlans, findCheckoutPlan, productsForPlan } from '@/lib/billing/subscription-plans'

export { resolvePlanCode }
