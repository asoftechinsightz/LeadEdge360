import crypto from 'crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
}

export function getGoogleClientId() {
  return GOOGLE_CLIENT_ID
}

export function buildGoogleAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: state || crypto.randomBytes(16).toString('hex'),
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(code, redirectUri) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Google token exchange failed')
  }
  if (!data.id_token) {
    throw new Error('Google did not return an id_token')
  }
  return verifyGoogleIdToken(data.id_token)
}

export async function verifyGoogleIdToken(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description || 'Invalid Google ID token')
  }
  if (GOOGLE_CLIENT_ID && data.aud !== GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch')
  }
  if (!data.email_verified || data.email_verified === 'false') {
    throw new Error('Google email not verified')
  }
  return {
    googleId: data.sub,
    email: data.email,
    fullName: data.name || data.email?.split('@')[0] || 'User',
    picture: data.picture || null,
  }
}
