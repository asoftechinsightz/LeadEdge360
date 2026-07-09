import { fetchWithRetry, ensureFreshOAuthTokens } from './base.js'
import { refreshGoogleTokens } from '../oauth-google.js'
import { syncGmailToLeads } from '../gmail-sync.js'

export const gmailConnector = {
  id: 'gmail',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'GMAIL_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async resolveTokens(creds) {
    return ensureFreshOAuthTokens(creds, refreshGoogleTokens)
  },

  async testConnection(creds) {
    const tokens = await this.resolveTokens(creds)
    const res = await fetchWithRetry('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}`, refreshedCredentials: tokens }
    }
    return {
      ok: true,
      healthy: true,
      message: `Gmail: ${data.emailAddress || 'connected'}`,
      metadata: { email: data.emailAddress },
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
        message: 'Gmail email sync is disabled in settings',
        refreshedCredentials: test.refreshedCredentials,
      }
    }

    const result = await syncGmailToLeads(db, orgId, test.refreshedCredentials || creds)
    return {
      ok: result.ok,
      recordsSynced: result.synced || 0,
      message: result.message,
      refreshedCredentials: result.refreshedCredentials || test.refreshedCredentials,
    }
  },

  verifyWebhook() {
    return { ok: true, reason: 'gmail_uses_push_notifications' }
  },
}
