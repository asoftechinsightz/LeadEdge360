import { fetchWithRetry, ensureFreshOAuthTokens } from './base.js'
import { refreshLinkedInTokens } from '../oauth-linkedin.js'

export const linkedinConnector = {
  id: 'linkedin',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'LINKEDIN_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async resolveTokens(creds) {
    if (!creds.refreshToken) return creds
    return ensureFreshOAuthTokens(creds, refreshLinkedInTokens)
  },

  async testConnection(creds) {
    const tokens = await this.resolveTokens(creds)
    const res = await fetchWithRetry('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.message || data.error || `HTTP ${res.status}`, refreshedCredentials: tokens }
    }
    return {
      ok: true,
      healthy: true,
      message: `LinkedIn: ${data.name || data.email || 'connected'}`,
      metadata: { name: data.name, email: data.email, sub: data.sub },
      refreshedCredentials: tokens,
    }
  },

  async syncData(creds, _metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }
    const leadCount = await db.collection('leads').countDocuments({ orgId, source: 'linkedin' }).catch(() => 0)
    return {
      ok: true,
      recordsSynced: leadCount,
      message: `LinkedIn sync: ${leadCount} CRM leads from LinkedIn`,
      refreshedCredentials: test.refreshedCredentials,
    }
  },

  verifyWebhook() {
    return { ok: true, reason: 'linkedin_webhooks_optional' }
  },
}
