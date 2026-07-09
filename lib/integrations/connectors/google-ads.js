import { fetchWithRetry, ensureFreshOAuthTokens } from './base.js'
import { refreshGoogleTokens } from '../oauth-google.js'
import { syncGoogleAdCampaigns } from '../google-ads.js'

const DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''

export const googleAdsConnector = {
  id: 'google_ads',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'GOOGLE_ADS_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async resolveTokens(creds) {
    return ensureFreshOAuthTokens(creds, refreshGoogleTokens)
  },

  async testConnection(creds) {
    const tokens = await this.resolveTokens(creds)
    if (DEV_TOKEN) {
      const res = await fetchWithRetry(
        'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'developer-token': DEV_TOKEN,
          },
        },
      )
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const count = data.resourceNames?.length || 0
        return {
          ok: true,
          healthy: true,
          message: `Google Ads: ${count} accessible account(s)`,
          metadata: { accountCount: count },
          refreshedCredentials: tokens,
        }
      }
    }
    const info = await fetchWithRetry(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(tokens.accessToken)}`,
    )
    const data = await info.json().catch(() => ({}))
    if (!info.ok) {
      return { ok: false, healthy: false, message: data.error || 'Token invalid', refreshedCredentials: tokens }
    }
    return {
      ok: true,
      healthy: true,
      message: DEV_TOKEN ? 'Google Ads token valid' : 'Google Ads OAuth OK (set GOOGLE_ADS_DEVELOPER_TOKEN for full API test)',
      metadata: { email: data.email, scope: data.scope },
      refreshedCredentials: tokens,
    }
  },

  async syncData(creds, metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }

    const result = await syncGoogleAdCampaigns(db, orgId, test.refreshedCredentials || creds, {
      customerId: metadata?.customerId,
    })
    return {
      ok: result.ok,
      recordsSynced: result.synced || 0,
      message: result.message,
      refreshedCredentials: result.refreshedCredentials || test.refreshedCredentials,
    }
  },

  verifyWebhook() {
    return { ok: true, reason: 'google_ads_uses_pubsub' }
  },
}
