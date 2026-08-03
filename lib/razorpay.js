// Razorpay helper. Returns null client when keys are missing so we degrade
// gracefully (UI falls back to “Talk to sales” / “Contact us”).
import crypto from 'crypto'

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

export function verifyCheckoutSignature({ order_id, payment_id, signature }) {
  if (!process.env.RAZORPAY_KEY_SECRET) return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${order_id}|${payment_id}`)
    .digest('hex')
  return expected === signature
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}

export const PLANS = [
  { id: 'starter', name: 'Starter',  price: 1499,  currency: 'INR', interval: 'monthly' },
  { id: 'growth',  name: 'Growth',   price: 4999,  currency: 'INR', interval: 'monthly' },
  { id: 'scale',   name: 'Scale',    price: null,  currency: 'INR', interval: 'monthly', custom: true },
]
