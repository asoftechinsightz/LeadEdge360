import crypto from 'crypto'
import { fetchWithRetry } from './base.js'
import { syncMetaAdCampaigns } from '../meta-ads.js'

export const facebookLeadsConnector = {
  id: 'facebook_leads',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'FACEBOOK_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async testConnection(creds) {
    const res = await fetchWithRetry(
      'https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status&limit=5',
      { headers: { Authorization: `Bearer ${creds.accessToken}` } },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}` }
    }
    const count = data.data?.length || 0
    return {
      ok: true,
      healthy: true,
      message: count ? `Facebook: ${count} ad account(s)` : 'Facebook connected (no ad accounts yet)',
      metadata: { adAccounts: data.data?.map((a) => ({ id: a.account_id, name: a.name })) || [] },
    }
  },

  async syncData(creds, _metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }

    const result = await syncMetaAdCampaigns(db, orgId, creds)
    return {
      ok: result.ok,
      recordsSynced: result.synced || 0,
      message: result.message,
    }
  },

  verifyWebhook(rawBody, headers, creds) {
    const sig = headers.get('x-hub-signature-256') || ''
    const secret = creds?.appSecret || process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET
    if (!secret) return { ok: false, reason: 'webhook_secret_missing' }
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
    return { ok: sig === expected, reason: sig === expected ? 'verified' : 'signature_mismatch' }
  },
}
