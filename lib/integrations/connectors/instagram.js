import crypto from 'crypto'
import { fetchWithRetry } from './base.js'

export const instagramConnector = {
  id: 'instagram',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'INSTAGRAM_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async testConnection(creds) {
    const res = await fetchWithRetry(
      'https://graph.facebook.com/v18.0/me/accounts?fields=name,instagram_business_account{id,username}&limit=10',
      { headers: { Authorization: `Bearer ${creds.accessToken}` } },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}` }
    }
    const ig = (data.data || []).find((p) => p.instagram_business_account)?.instagram_business_account
    return {
      ok: true,
      healthy: true,
      message: ig ? `Instagram: @${ig.username}` : 'Meta connected (link Instagram Business to a Page)',
      metadata: { instagramId: ig?.id, username: ig?.username },
    }
  },

  async syncData(creds, metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }
    const igId = test.metadata?.instagramId
    let upserted = 0
    if (igId) {
      const mediaRes = await fetchWithRetry(
        `https://graph.facebook.com/v18.0/${igId}/media?fields=id,caption,media_type,timestamp&limit=15`,
        { headers: { Authorization: `Bearer ${creds.accessToken}` } },
      )
      const media = await mediaRes.json().catch(() => ({}))
      for (const item of media.data || []) {
        await db.collection('integration_sync_records').updateOne(
          { orgId, integrationId: 'instagram', externalId: item.id },
          {
            $set: {
              orgId,
              integrationId: 'instagram',
              externalId: item.id,
              type: 'media',
              caption: item.caption?.slice(0, 200),
              mediaType: item.media_type,
              timestamp: item.timestamp,
              syncedAt: new Date().toISOString(),
            },
          },
          { upsert: true },
        )
        upserted++
      }
    }
    return {
      ok: true,
      recordsSynced: upserted,
      message: `Instagram: synced ${upserted} media items`,
      metadata: test.metadata,
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
