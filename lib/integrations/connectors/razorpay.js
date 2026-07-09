import { fetchWithRetry, verifyHmacWebhook } from './base.js'

export const razorpayConnector = {
  id: 'razorpay',

  validateCredentials(creds) {
    if (!creds?.keyId || !creds?.keySecret) {
      return { ok: false, error: 'RAZORPAY_KEY_ID_AND_SECRET_REQUIRED' }
    }
    return { ok: true }
  },

  async testConnection(creds) {
    const v = this.validateCredentials(creds)
    if (!v.ok) return { ok: false, healthy: false, message: v.error }
    const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64')
    const res = await fetchWithRetry('https://api.razorpay.com/v1/payments?count=1', {
      headers: { Authorization: `Basic ${auth}` },
    })
    if (res.status === 401) {
      return { ok: false, healthy: false, message: 'Invalid Razorpay credentials' }
    }
    return { ok: true, healthy: res.ok, message: res.ok ? 'Razorpay API reachable' : `HTTP ${res.status}` }
  },

  async syncData(creds, _metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }
    const count = await db.collection('payments').countDocuments({ orgId })
    return { ok: true, recordsSynced: count, message: `Indexed ${count} payment records` }
  },

  verifyWebhook(rawBody, headers, creds) {
    const sig = headers.get('x-razorpay-signature') || ''
    const secret = creds?.webhookSecret
    if (!secret) return { ok: false, reason: 'webhook_secret_missing' }
    const ok = verifyHmacWebhook(rawBody, sig, secret)
    return { ok, reason: ok ? 'verified' : 'signature_mismatch' }
  },
}
