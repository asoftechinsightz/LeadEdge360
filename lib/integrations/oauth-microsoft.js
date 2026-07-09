import crypto from 'crypto'
import { fetchWithRetry } from './retry.js'

const MS_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || ''
const MS_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || ''
const MS_TENANT = process.env.MICROSOFT_TENANT_ID || 'common'

export function isMicrosoftOAuthConfigured() {
  return Boolean(MS_CLIENT_ID && MS_CLIENT_SECRET)
}

export function buildMicrosoftAuthUrl({ redirectUri, state, scopes }) {
  const params = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    response_mode: 'query',
    state: state || crypto.randomBytes(16).toString('hex'),
  })
  return `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/authorize?${params}`
}

export async function exchangeMicrosoftCode(code, redirectUri) {
  const body = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    client_secret: MS_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const res = await fetchWithRetry(`https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'MICROSOFT_TOKEN_EXCHANGE_FAILED')
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
    scope: data.scope,
    tokenType: data.token_type,
  }
}

export async function refreshMicrosoftTokens(refreshToken) {
  const body = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    client_secret: MS_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetchWithRetry(`https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'MICROSOFT_REFRESH_FAILED')
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
  }
}
