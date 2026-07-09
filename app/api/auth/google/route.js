import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { getDb } from '@/lib/mongo'
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  verifyGoogleIdToken,
  isGoogleAuthConfigured,
} from '@/lib/google-auth'
import { signAccessToken, issueRefreshToken, TOKEN_TTLS } from '@/lib/jwt'

const json = (data, init = {}) => NextResponse.json(data, init)

function pickUser(u) {
  if (!u) return null
  const { passwordHash, _id, ...rest } = u
  return rest
}

async function findOrCreateGoogleUser(db, profile) {
  let user = await db.collection('users').findOne({
    $or: [{ googleId: profile.googleId }, { email: profile.email }],
  })
  if (user) {
    const update = {
      googleId: profile.googleId,
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    }
    if (profile.picture && !user.picture) update.picture = profile.picture
    if (user.status === 'invited') update.status = 'active'
    await db.collection('users').updateOne({ id: user.id }, { $set: update })
    return db.collection('users').findOne({ id: user.id })
  }

  const orgId = uuid()
  await db.collection('orgs').insertOne({
    id: orgId,
    name: `${profile.fullName}'s Workspace`,
    ownerEmail: profile.email,
    plan: 'starter',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  })

  user = {
    id: uuid(),
    orgId,
    googleId: profile.googleId,
    email: profile.email,
    fullName: profile.fullName,
    picture: profile.picture,
    role: 'admin',
    status: 'active',
    businessSuiteEnabled: true,
    products: ['leadedge360'],
    activeProduct: 'leadedge360',
    emailVerified: true,
    phoneVerified: false,
    preferences: { notifications: { push: true, email: true, whatsapp: true } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await db.collection('users').insertOne(user)
  return user
}

async function issueAuthResponse(db, user, request, device = 'web') {
  const ctx = {
    device,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
    ua: request.headers.get('user-agent') || '',
  }
  const access = signAccessToken({
    userId: user.id,
    tenantId: user.orgId,
    role: user.role || 'admin',
    perms: [],
  })
  const refresh = await issueRefreshToken({ userId: user.id, ...ctx })
  return {
    accessToken: access,
    refreshToken: refresh,
    expiresIn: TOKEN_TTLS.access,
    tokenType: 'Bearer',
    user: pickUser(user),
  }
}

function appOrigin(request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
}

/** GET — redirect browser to Google OAuth consent screen */
export async function GET(request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL('/signin?auth_error=google_not_configured', appOrigin(request)))
  }
  const origin = appOrigin(request)
  const redirectUri = `${origin}/api/auth/google/callback`
  const state = crypto.randomBytes(16).toString('hex')
  const url = buildGoogleAuthUrl({ redirectUri, state })
  const res = NextResponse.redirect(url)
  res.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return res
}

/** POST — exchange Google ID token (mobile / SPA) or authorization code */
export async function POST(request) {
  if (!isGoogleAuthConfigured()) {
    return json({ code: 'AUTH_GOOGLE_NOT_CONFIGURED', message: 'Google login is not configured' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const db = await getDb()

  try {
    let profile
    if (body.idToken) {
      profile = await verifyGoogleIdToken(body.idToken)
    } else if (body.code) {
      const redirectUri = body.redirectUri || `${appOrigin(request)}/api/auth/google/callback`
      profile = await exchangeGoogleCode(body.code, redirectUri)
    } else {
      return json({ code: 'VALIDATION_FAILED', message: 'idToken or code required' }, { status: 400 })
    }

    const user = await findOrCreateGoogleUser(db, profile)
    if (user.status === 'suspended') {
      return json({ code: 'AUTH_ACCOUNT_SUSPENDED', message: 'Account suspended' }, { status: 403 })
    }
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { lastLoginAt: new Date().toISOString() } },
    )
    const tokens = await issueAuthResponse(db, user, request, body.device || 'android')
    return json(tokens)
  } catch (e) {
    return json({ code: 'AUTH_GOOGLE_FAILED', message: e.message || 'Google authentication failed' }, { status: 401 })
  }
}
