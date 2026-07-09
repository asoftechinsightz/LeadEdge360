import { fetchWithRetry, ensureFreshOAuthTokens } from './base.js'
import { refreshGoogleTokens } from '../oauth-google.js'

export const googleBusinessConnector = {
  id: 'google_business',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'GOOGLE_BUSINESS_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async resolveTokens(creds) {
    return ensureFreshOAuthTokens(creds, refreshGoogleTokens)
  },

  async testConnection(creds) {
    const tokens = await this.resolveTokens(creds)
    const res = await fetchWithRetry(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}`, refreshedCredentials: tokens }
    }
    const count = data.accounts?.length || 0
    const name = data.accounts?.[0]?.accountName
    return {
      ok: true,
      healthy: true,
      message: count ? `Google Business: ${name || count + ' account(s)'}` : 'Google Business connected',
      metadata: { accountCount: count, accounts: data.accounts?.slice(0, 5) },
      refreshedCredentials: tokens,
    }
  },

  async syncData(creds, _metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }
    let upserted = 0
    for (const acct of test.metadata?.accounts || []) {
      await db.collection('integration_sync_records').updateOne(
        { orgId, integrationId: 'google_business', externalId: acct.name },
        {
          $set: {
            orgId,
            integrationId: 'google_business',
            externalId: acct.name,
            type: 'account',
            accountName: acct.accountName,
            syncedAt: new Date().toISOString(),
          },
        },
        { upsert: true },
      )
      upserted++
    }
    return {
      ok: true,
      recordsSynced: upserted,
      message: `Google Business Profile: ${upserted} account(s) synced`,
      refreshedCredentials: test.refreshedCredentials,
    }
  },

  verifyWebhook() {
    return { ok: true, reason: 'google_business_uses_pubsub' }
  },
}
