import crypto from 'crypto'
import { fetchWithRetry } from '../retry.js'

export function createStubConnector(integrationId, phase) {
  return {
    id: integrationId,
    validateCredentials() {
      return { ok: false, error: `INTEGRATION_PHASE_${phase}_NOT_IMPLEMENTED` }
    },
    async testConnection() {
      return { ok: false, healthy: false, message: `Available in phase ${phase}` }
    },
    async syncData() {
      return { ok: false, recordsSynced: 0, message: `Sync available in phase ${phase}` }
    },
    verifyWebhook() {
      return { ok: false, reason: 'not_implemented' }
    },
  }
}

export async function ensureFreshOAuthTokens(creds, refreshFn) {
  if (!creds?.refreshToken) return creds
  const expiresAt = creds.expiresAt ? new Date(creds.expiresAt).getTime() : 0
  if (expiresAt && expiresAt > Date.now() + 60_000) return creds
  const refreshed = await refreshFn(creds.refreshToken)
  return { ...creds, ...refreshed }
}

export function verifyHmacWebhook(rawBody, signature, secret, algo = 'sha256') {
  if (!secret || !signature) return false
  const expected = crypto.createHmac(algo, secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return expected === signature
  }
}

export { fetchWithRetry }
