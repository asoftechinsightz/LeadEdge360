// Emergent Auth helpers (server-side). Reads the `emergent_session` cookie
// and verifies it against Emergent's API. Designed for Next.js 14 App Router.
// Gracefully degrades when EMERGENT_PROJECT_ID / EMERGENT_API_KEY are missing
// (returns null user instead of crashing) so the dev preview still renders.

export const AUTH_CONFIGURED = !!(process.env.EMERGENT_PROJECT_ID && process.env.EMERGENT_API_KEY)

export function loginUrl(redirectUri) {
  if (!AUTH_CONFIGURED) return '/auth/setup'
  const base = 'https://auth.emergent.sh/login'
  const qs = new URLSearchParams({
    client_id: process.env.EMERGENT_PROJECT_ID,
    redirect_uri: redirectUri,
  })
  return `${base}?${qs.toString()}`
}

export async function exchangeSessionId(sessionId) {
  if (!AUTH_CONFIGURED) return null
  const r = await fetch('https://api.emergent.sh/v1/auth/exchange', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.EMERGENT_API_KEY}`,
    },
    body: JSON.stringify({ session_id: sessionId }),
  })
  if (!r.ok) return null
  return r.json() // { user: { email, name, picture }, session_token }
}

export async function verifySessionToken(token) {
  if (!AUTH_CONFIGURED || !token) return null
  const r = await fetch('https://api.emergent.sh/v1/auth/verify', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) return null
  const j = await r.json()
  return j.user || null
}

// Read session from a Next.js Request (route handler)
export async function getSessionUser(request) {
  try {
    const token = request.cookies.get('emergent_session')?.value
    if (!token) return null
    return await verifySessionToken(token)
  } catch {
    return null
  }
}
