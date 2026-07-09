import crypto from 'crypto'
import { fetchWithRetry } from './base.js'

export const whatsappConnector = {
  id: 'whatsapp',

  validateCredentials(creds) {
    if (!creds?.accessToken || !creds?.phoneNumberId) {
      return { ok: false, error: 'WHATSAPP_TOKEN_AND_PHONE_ID_REQUIRED' }
    }
    return { ok: true }
  },

  async testConnection(creds) {
    const v = this.validateCredentials(creds)
    if (!v.ok) return { ok: false, healthy: false, message: v.error }
    const url = `https://graph.facebook.com/v18.0/${creds.phoneNumberId}?fields=verified_name,display_phone_number`
    const res = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${creds.accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}` }
    }
    return {
      ok: true,
      healthy: true,
      message: `Connected as ${data.verified_name || data.display_phone_number || creds.phoneNumberId}`,
      metadata: { verifiedName: data.verified_name, displayPhone: data.display_phone_number },
    }
  },

  async syncData(creds, _metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }
    const threads = await db.collection('whatsapp_threads').countDocuments({ orgId })
    return { ok: true, recordsSynced: threads, message: `Synced ${threads} WhatsApp threads` }
  },

  verifyWebhook(rawBody, headers, creds) {
    const sig = headers.get('x-hub-signature-256') || ''
    const secret = creds?.appSecret || creds?.webhookSecret
    if (!secret) return { ok: false, reason: 'webhook_secret_missing' }
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
    return { ok: sig === expected, reason: sig === expected ? 'verified' : 'signature_mismatch' }
  },
}
