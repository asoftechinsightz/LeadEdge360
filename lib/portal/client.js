const PORTAL_TOKEN_KEY = 'portalAccessToken'
const PORTAL_USER_KEY = 'portalCustomer'

export function getPortalToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PORTAL_TOKEN_KEY)
}

export function setPortalSession(accessToken, customer) {
  localStorage.setItem(PORTAL_TOKEN_KEY, accessToken)
  localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(customer))
}

export function clearPortalSession() {
  localStorage.removeItem(PORTAL_TOKEN_KEY)
  localStorage.removeItem(PORTAL_USER_KEY)
}

export function getPortalCustomer() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PORTAL_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function portalFetch(path, { method = 'GET', body } = {}) {
  const token = getPortalToken()
  const res = await fetch(`/api/portal${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Request failed')
    throw err
  }
  return data
}
