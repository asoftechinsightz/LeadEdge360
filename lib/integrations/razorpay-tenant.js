import { getDb } from '@/lib/mongo'
import { getOrgIntegration, getDecryptedCredentials } from './store.js'

let Razorpay = null
try { Razorpay = require('razorpay') } catch {}

/**
 * Resolve Razorpay credentials: per-tenant integration first, then platform env.
 */
export async function getRazorpayCredentialsForOrg(orgId) {
  if (orgId) {
    try {
      const db = await getDb()
      const record = await getOrgIntegration(db, orgId, 'razorpay')
      const c = record?.status === 'connected' ? await getDecryptedCredentials(record) : null
      if (c?.keyId && c?.keySecret) {
        return {
          keyId: c.keyId,
          keySecret: c.keySecret,
          webhookSecret: c.webhookSecret || null,
          source: 'tenant',
        }
      }
    } catch {
      /* fall through to platform keys */
    }
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (keyId && keySecret) {
    return {
      keyId,
      keySecret,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,
      source: 'platform',
    }
  }
  return null
}

export async function getRazorpayForOrg(orgId) {
  const creds = await getRazorpayCredentialsForOrg(orgId)
  if (!creds || !Razorpay) return null
  return {
    client: new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret }),
    credentials: creds,
  }
}

export async function isRazorpayConfiguredForOrg(orgId) {
  const creds = await getRazorpayCredentialsForOrg(orgId)
  return Boolean(creds?.keyId && creds?.keySecret)
}
