import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { getDb } from '@/lib/mongo'
import { exchangeGoogleCode, isGoogleAuthConfigured } from '@/lib/google-auth'
import { signAccessToken, issueRefreshToken, TOKEN_TTLS } from '@/lib/jwt'

function appOrigin(request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
}

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

/** OAuth redirect handler — exchanges code and redirects to web completion page */
export async function GET(request) {
  const origin = appOrigin(request)
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/signin?auth_error=${encodeURIComponent(error)}`)
  }

  if (!code || !isGoogleAuthConfigured()) {
    return NextResponse.redirect(`${origin}/signin?auth_error=google_failed`)
  }

  const cookieState = request.cookies.get('google_oauth_state')?.value
  if (!cookieState || cookieState !== state) {
    return NextResponse.redirect(`${origin}/signin?auth_error=invalid_state`)
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`
    const profile = await exchangeGoogleCode(code, redirectUri)
    const db = await getDb()
    const user = await findOrCreateGoogleUser(db, profile)
    if (user.status === 'suspended') {
      return NextResponse.redirect(`${origin}/signin?auth_error=account_suspended`)
    }

    const ctx = {
      device: 'web',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      ua: request.headers.get('user-agent') || '',
    }
    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: user.orgId,
      role: user.role || 'admin',
      perms: [],
    })
    const refreshToken = await issueRefreshToken({ userId: user.id, ...ctx })

    const exchangeCode = crypto.randomBytes(24).toString('hex')
    await db.collection('auth_exchange_codes').insertOne({
      code: exchangeCode,
      accessToken,
      refreshToken,
      expiresIn: TOKEN_TTLS.access,
      user: pickUser(user),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      consumedAt: null,
    })

    const res = NextResponse.redirect(`${origin}/signin/google-complete?code=${exchangeCode}`)
    res.cookies.delete('google_oauth_state')
    return res
  } catch {
    return NextResponse.redirect(`${origin}/signin?auth_error=google_exchange_failed`)
  }
}
