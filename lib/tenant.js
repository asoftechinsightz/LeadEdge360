// Multi-tenant helper. Every authenticated user belongs to an organisation (org).
// Supports BOTH Emergent Auth (cookie session) AND JWT bearer (mobile app).

import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getDb } from './mongo'
import { getSessionUser } from './auth'
import { verifyAccessToken } from './jwt'
import { buildRequestActor } from './request-actor'
import { isPublicDemoAllowed } from './security-config.js'

export const DEMO_ORG_ID = 'demo-org'

// Ensure a user has an org. Returns { user, orgId }.
export async function ensureUserOrg(emergentUser) {
  const db = await getDb()
  const users = db.collection('users')
  const orgs = db.collection('orgs')

  let user = await users.findOne({ email: emergentUser.email })
  if (!user) {
    const orgId = uuid()
    await orgs.insertOne({
      id: orgId,
      name: `${emergentUser.name || emergentUser.email.split('@')[0]}'s Workspace`,
      ownerEmail: emergentUser.email,
      createdAt: new Date().toISOString(),
      plan: 'starter',
    })
    const newUser = {
      id: uuid(),
      email: emergentUser.email,
      name: emergentUser.name || '',
      picture: emergentUser.picture || '',
      orgId,
      role: 'admin',
      dpdpConsent: { accepted: false, acceptedAt: null, version: '1.0' },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
    await users.insertOne(newUser)
    user = newUser
  } else {
    await users.updateOne(
      { email: emergentUser.email },
      { $set: { lastLoginAt: new Date().toISOString(), picture: emergentUser.picture || user.picture } }
    )
  }
  return { user, orgId: user.orgId }
}

// Resolve the tenant for a given request. Returns { orgId, user|null, isDemo }.
export async function resolveTenant(request) {
  const db = await getDb()

  // 1) JWT bearer (mobile app)
  const auth = request.headers.get('authorization') || ''
  if (auth.startsWith('Bearer ')) {
    const payload = verifyAccessToken(auth.slice(7))
    if (payload?.sub) {
      const user = await db.collection('users').findOne({ id: payload.sub }, { projection: { _id: 0, passwordHash: 0 } })
      if (user) return { orgId: user.orgId, user, isDemo: false, authType: 'jwt' }
    }
  }

  // 2) Emergent Auth cookie session
  const sessUser = await getSessionUser(request)
  if (!sessUser) {
    if (!isPublicDemoAllowed()) {
      return { orgId: null, user: null, isDemo: false, authType: 'none', unauthenticated: true }
    }
    return { orgId: DEMO_ORG_ID, user: null, isDemo: true, authType: 'demo' }
  }
  const user = await db.collection('users').findOne({ email: sessUser.email }, { projection: { _id: 0, passwordHash: 0 } })
  if (!user) {
    const { user: u, orgId } = await ensureUserOrg(sessUser)
    return { orgId, user: u, isDemo: false, authType: 'cookie' }
  }
  return { orgId: user.orgId, user, isDemo: false, authType: 'cookie' }
}

// Resolve web cookie session to a RequestActor for the JWT bridge (E-002).
// Returns { userId, orgId, role, email, user, isDemo } or { error: NextResponse }.
export async function resolveWebActor(request) {
  const sessUser = await getSessionUser(request)
  if (!sessUser) {
    return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) }
  }

  const db = await getDb()
  let user = await db.collection('users').findOne(
    { email: sessUser.email },
    { projection: { _id: 0, passwordHash: 0 } }
  )
  if (!user) {
    const ensured = await ensureUserOrg(sessUser)
    user = ensured.user
  }

  const actor = buildRequestActor(user)
  if (!actor) {
    return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) }
  }

  return {
    ...actor,
    isDemo: actor.orgId === DEMO_ORG_ID,
  }
}
