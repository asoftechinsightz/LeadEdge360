const INSECURE_JWT_SECRETS = new Set([
  'dev-secret-change-me',
  '',
  undefined,
  null,
])

export function isProductionMode() {
  return process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true'
}

export function assertProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return { ok: true, warnings: [] }

  const warnings = []
  const secret = process.env.JWT_SECRET
  if (INSECURE_JWT_SECRETS.has(secret)) {
    throw new Error('INSECURE_JWT_SECRET')
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    warnings.push('RAZORPAY_WEBHOOK_SECRET not set')
  }
  if (!process.env.MONGO_URL) {
    warnings.push('MONGO_URL not set')
  }
  return { ok: true, warnings }
}

export function isWebhookTokenSecure() {
  const token = process.env.N8N_WEBHOOK_TOKEN
  if (!token) return false
  return token !== 'change-me-to-a-long-random-string'
}
