import crypto from 'crypto'
import { fetchWithRetry } from './retry.js'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || ''
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || ''

export function isLinkedInOAuthConfigured() {
  return Boolean(LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET)
}

export function buildLinkedInAuthUrl({ redirectUri, state, scopes }) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: state || crypto.randomBytes(16).toString('hex'),
  })
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`
}

export async function exchangeLinkedInCode(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  })
  const res = await fetchWithRetry('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'LINKEDIN_TOKEN_EXCHANGE_FAILED')
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
    scope: data.scope,
    tokenType: data.token_type,
  }
}

export async function refreshLinkedInTokens(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  })
  const res = await fetchWithRetry('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'LINKEDIN_REFRESH_FAILED')
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : null,
  }
}
