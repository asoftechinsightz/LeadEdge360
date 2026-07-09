import { fetchWithRetry, ensureFreshOAuthTokens } from './base.js'
import { refreshMicrosoftTokens } from '../oauth-microsoft.js'
import { syncOutlookToLeads } from '../outlook-sync.js'

export const microsoft365Connector = {
  id: 'microsoft365',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'MICROSOFT_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async resolveTokens(creds) {
    return ensureFreshOAuthTokens(creds, refreshMicrosoftTokens)
  },

  async testConnection(creds) {
    const tokens = await this.resolveTokens(creds)
    const res = await fetchWithRetry('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}`, refreshedCredentials: tokens }
    }
    return {
      ok: true,
      healthy: true,
      message: `Microsoft 365: ${data.mail || data.userPrincipalName}`,
      metadata: { email: data.mail || data.userPrincipalName, displayName: data.displayName },
      refreshedCredentials: tokens,
    }
  },

  async syncData(creds, metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }

    if (metadata?.emailSyncEnabled === false) {
      return {
        ok: true,
        recordsSynced: 0,
        message: 'Outlook email sync is disabled in settings',
        refreshedCredentials: test.refreshedCredentials,
      }
    }

    const result = await syncOutlookToLeads(db, orgId, test.refreshedCredentials || creds)
    return {
      ok: result.ok,
      recordsSynced: result.synced || 0,
      message: result.message,
      refreshedCredentials: result.refreshedCredentials || test.refreshedCredentials,
    }
  },

  verifyWebhook() {
    return { ok: true, reason: 'microsoft_uses_graph_subscriptions' }
  },
}
