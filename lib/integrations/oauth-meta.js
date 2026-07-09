import crypto from 'crypto'
import { fetchWithRetry } from './retry.js'

const META_APP_ID = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID || ''
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || ''

export function isMetaOAuthConfigured() {
  return Boolean(META_APP_ID && META_APP_SECRET)
}

export function buildMetaAuthUrl({ redirectUri, state, scopes }) {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(','),
    state: state || crypto.randomBytes(16).toString('hex'),
  })
  return `https://www.facebook.com/v18.0/dialog/oauth?${params}`
}

export async function exchangeMetaCode(code, redirectUri) {
  const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
  tokenUrl.searchParams.set('client_id', META_APP_ID)
  tokenUrl.searchParams.set('client_secret', META_APP_SECRET)
  tokenUrl.searchParams.set('redirect_uri', redirectUri)
  tokenUrl.searchParams.set('code', code)

  const res = await fetchWithRetry(tokenUrl.toString())
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || data.error || 'META_TOKEN_EXCHANGE_FAILED')
  }

  let accessToken = data.access_token
  let expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null

  const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
  longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
  longLivedUrl.searchParams.set('client_id', META_APP_ID)
  longLivedUrl.searchParams.set('client_secret', META_APP_SECRET)
  longLivedUrl.searchParams.set('fb_exchange_token', accessToken)

  const ll = await fetchWithRetry(longLivedUrl.toString())
  const llData = await ll.json()
  if (ll.ok && llData.access_token) {
    accessToken = llData.access_token
    expiresAt = llData.expires_in
      ? new Date(Date.now() + llData.expires_in * 1000).toISOString()
      : expiresAt
  }

  return {
    accessToken,
    refreshToken: null,
    expiresAt,
    scope: null,
    tokenType: 'bearer',
  }
}

export async function refreshMetaTokens() {
  throw new Error('META_REQUIRES_RECONNECT')
}
