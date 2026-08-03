/**
 * Security hardening helpers (Phase 0 remediation). No product logic.
 */

export const DEFAULT_JWT_SECRET = 'dev-secret-change-me'
export const DEFAULT_N8N_WEBHOOK_TOKEN = 'change-me-to-a-long-random-string'
const DEMO_ORG_ID = 'demo-org'

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

/** Demo CRM without login: allowed in dev; production requires ALLOW_PUBLIC_DEMO_ORG=true */
export function isPublicDemoAllowed() {
  if (!isProduction()) return true
  return process.env.ALLOW_PUBLIC_DEMO_ORG === 'true'
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  const weak = !secret || secret === DEFAULT_JWT_SECRET || secret.length < 16
  if (isProduction() && weak) {
    throw new Error(
      'JWT_SECRET must be set to a strong value (≥16 chars) in production'
    )
  }
  return secret || DEFAULT_JWT_SECRET
}

export function getCorsAllowOrigin() {
  const raw = (process.env.CORS_ORIGINS || '').trim()
  if (isProduction()) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL
    if (appUrl) return appUrl.replace(/\/$/, '')
    if (raw && raw !== '*') return raw.split(',')[0].trim()
    return ''
  }
  if (!raw || raw === '*') return '*'
  return raw.split(',')[0].trim()
}

export function getSecurityHeaders() {
  const corsOrigin = getCorsAllowOrigin()
  return [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
    ...(corsOrigin
      ? [
          { key: 'Access-Control-Allow-Origin', value: corsOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Webhook-Token' },
        ]
      : []),
  ]
}

export function isIngestWebhookAllowed(req) {
  const token = process.env.N8N_WEBHOOK_TOKEN
  const header = req.headers.get('x-webhook-token')
  if (isProduction()) {
    if (!token || token === DEFAULT_N8N_WEBHOOK_TOKEN) return false
    return header === token
  }
  if (!token || token === DEFAULT_N8N_WEBHOOK_TOKEN) return true
  return header === token
}

/** Server-side org for n8n lead ingest — never trust body.orgId */
export function resolveWebhookOrgId(channel) {
  const byChannel = {
    whatsapp: process.env.N8N_WEBHOOK_ORG_WHATSAPP,
    facebook: process.env.N8N_WEBHOOK_ORG_FACEBOOK,
    google: process.env.N8N_WEBHOOK_ORG_GOOGLE,
  }
  const orgId = byChannel[channel] || process.env.N8N_WEBHOOK_ORG_ID
  if (isProduction() && !orgId) return null
  return orgId || DEMO_ORG_ID
}

export function isBillingSimulateAllowed() {
  if (isProduction()) return false
  return process.env.BILLING_TEST_MODE === 'true'
}
