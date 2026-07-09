import { NextResponse } from 'next/server'
import { signAccessToken, verifyAccessToken, TOKEN_TTLS } from './jwt'
import { DEMO_ORG_ID } from './tenant'
import { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } from './dev-seed'

export const DEV_ADMIN_ID = '00000000-dev-admin-local'

export const DEV_USER = {
  id: DEV_ADMIN_ID,
  orgId: DEMO_ORG_ID,
  email: DEV_ADMIN_EMAIL,
  fullName: 'Anoop Kumar',
  name: 'Anoop Kumar',
  role: 'admin',
  status: 'active',
  businessSuiteEnabled: true,
  products: ['leadedge360', 'retailedge360'],
  activeProduct: 'leadedge360',
  subscriptionTier: 'enterprise',
  emailVerified: true,
  phoneVerified: true,
  phone: '+919999999999',
}

export function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS !== 'false'
}

function pickUser(u) {
  if (!u) return null
  const { passwordHash, _id, ...rest } = u
  return rest
}

export function buildDevTokenResponse(activeProduct) {
  const user = activeProduct
    ? { ...DEV_USER, activeProduct }
    : { ...DEV_USER }
  const accessToken = signAccessToken({
    userId: user.id,
    tenantId: user.orgId,
    role: user.role,
    perms: [],
  })
  return {
    accessToken,
    refreshToken: `dev-refresh-${user.id}`,
    expiresIn: TOKEN_TTLS.access,
    tokenType: 'Bearer',
    user: pickUser(user),
  }
}

export function tryDevLoginPassword(email, password) {
  if (!isDevAuthBypassEnabled()) return null
  if (email !== DEV_ADMIN_EMAIL || password !== DEV_ADMIN_PASSWORD) return null
  return buildDevTokenResponse()
}

export function getDevUserFromPayload(payload) {
  if (!isDevAuthBypassEnabled() || !payload?.sub) return null
  if (payload.sub !== DEV_ADMIN_ID) return null
  return { ...DEV_USER }
}

export function getDevUserFromRequest(request) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) return null
  const payload = verifyAccessToken(auth.slice(7))
  return getDevUserFromPayload(payload)
}

/** Handle API routes that must work without MongoDB in local dev. */
export async function tryDevApiRoute(method, segs, request) {
  if (!isDevAuthBypassEnabled()) return null

  const [root, id, action] = segs
  const user = getDevUserFromRequest(request)

  if (root === 'products') {
    if (!user) return null
    if (method === 'GET' && !id) {
      return NextResponse.json({
        products: user.products || ['leadedge360', 'retailedge360'],
        activeProduct: user.activeProduct || 'leadedge360',
        businessSuiteEnabled: true,
        subscriptionTier: 'enterprise',
      })
    }
    if (method === 'POST' && id === 'switch') {
      const body = await request.json().catch(() => ({}))
      const product = body.product
      if (!product || !user.products?.includes(product)) {
        return NextResponse.json(
          { code: 'PERMISSION_DENIED', message: 'Product access denied' },
          { status: 403 }
        )
      }
      return NextResponse.json({ ok: true, activeProduct: product })
    }
  }

  if (root === 'auth' && id === 'refresh-token' && method === 'POST') {
    const body = await request.json().catch(() => ({}))
    if (String(body.refreshToken || '').startsWith('dev-refresh-')) {
      return NextResponse.json(buildDevTokenResponse())
    }
  }

  return null
}
