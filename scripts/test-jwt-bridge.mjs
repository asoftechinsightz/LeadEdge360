/**
 * E-002 Cookie ↔ JWT bridge tests.
 *
 * Usage:
 *   MONGO_URL=mongodb://localhost:27017 DB_NAME=asoftech_saas_test_e002 node scripts/test-jwt-bridge.mjs
 */

import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'
import { signAccessToken } from '../lib/jwt.js'
import { cookieBridgeRoute, mobileRoute } from '../lib/mobile-routes.js'
import {
  buildRequestActor,
  isWebJwtBridgeEnabled,
  resolveAuthDispatch,
  BRIDGE_ROOTS,
} from '../lib/request-actor.js'

const BASE = 'http://localhost:3000/api'

function mockRequest(path, { method = 'GET', headers = {}, body } = {}) {
  const h = {}
  for (const [k, v] of Object.entries(headers)) h[k.toLowerCase()] = v
  return {
    url: `${BASE}${path}`,
    method,
    headers: { get: (name) => h[name.toLowerCase()] ?? null },
    json: async () => body || {},
    text: async () => JSON.stringify(body || {}),
    cookies: { get: () => null },
  }
}

async function readResponse(res) {
  const text = await res.text()
  let body = null
  try { body = JSON.parse(text) } catch { body = text }
  return { status: res.status, body }
}

async function seedOrg(db, { email, role = 'admin', orgName }) {
  const orgId = uuid()
  const userId = uuid()
  const now = new Date().toISOString()
  await db.collection('orgs').insertOne({
    id: orgId,
    name: orgName,
    ownerEmail: email,
    plan: 'growth',
    createdAt: now,
  })
  const user = {
    id: userId,
    orgId,
    email,
    fullName: orgName,
    role,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
  await db.collection('users').insertOne(user)
  return { orgId, userId, user }
}

async function runDispatchTests() {
  let failed = false
  const assert = (label, ok) => {
    console.log(ok ? '✓' : '✗', label)
    if (!ok) failed = true
  }

  const prevBridge = process.env.WEB_JWT_BRIDGE
  process.env.WEB_JWT_BRIDGE = 'false'
  assert('flag OFF by default', !isWebJwtBridgeEnabled())
  assert(
    'dispatch bridge_disabled_404 when flag off',
    resolveAuthDispatch({ root: 'followups', hasBearer: false, bridgeEnabled: false }) === 'bridge_disabled_404'
  )
  process.env.WEB_JWT_BRIDGE = 'true'
  assert('flag ON when set', isWebJwtBridgeEnabled())
  assert(
    'dispatch bridge when flag on',
    resolveAuthDispatch({ root: 'followups', hasBearer: false, bridgeEnabled: true }) === 'bridge'
  )
  assert(
    'dispatch jwt when Bearer present',
    resolveAuthDispatch({ root: 'followups', hasBearer: true, bridgeEnabled: true }) === 'jwt'
  )
  assert(
    'dispatch legacy for leads',
    resolveAuthDispatch({ root: 'leads', hasBearer: false, bridgeEnabled: true }) === 'legacy'
  )
  assert('BRIDGE_ROOTS includes followups', BRIDGE_ROOTS.includes('followups'))
  process.env.WEB_JWT_BRIDGE = prevBridge

  const built = buildRequestActor({
    id: 'u1',
    orgId: 'o1',
    email: 'a@b.com',
    role: 'admin',
  })
  assert('buildRequestActor maps fields', built?.userId === 'u1' && built?.orgId === 'o1')

  return failed
}

async function runIntegrationTests(db) {
  let failed = false
  const assert = (label, ok) => {
    console.log(ok ? '✓' : '✗', label)
    if (!ok) failed = true
  }

  const actorA = await seedOrg(db, { email: 'bridge-a@example.com', orgName: 'Org A' })
  const actorB = await seedOrg(db, { email: 'bridge-b@example.com', orgName: 'Org B' })
  const agentB = await seedOrg(db, { email: 'bridge-agent@example.com', orgName: 'Org Agent', role: 'agent' })

  const leadA = uuid()
  const now = new Date().toISOString()
  await db.collection('leads').insertOne({
    id: leadA,
    orgId: actorA.orgId,
    name: 'Lead A',
    phone: '+919900000001',
    status: 'New',
    createdAt: now,
    updatedAt: now,
  })

  const followupId = uuid()
  await db.collection('follow_ups').insertOne({
    id: followupId,
    orgId: actorA.orgId,
    leadId: leadA,
    title: 'Call back',
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'open',
    assignedToId: actorA.userId,
    createdAt: now,
    updatedAt: now,
  })

  // ─── JWT path ───
  const tokenA = signAccessToken({
    userId: actorA.userId,
    tenantId: actorA.orgId,
    role: 'admin',
    perms: [],
  })
  const jwtListReq = mockRequest('/followups', {
    headers: { Authorization: `Bearer ${tokenA}` },
  })
  const jwtListRes = await readResponse(
    await mobileRoute({
      root: 'followups',
      id: undefined,
      action: undefined,
      segs: ['followups'],
      method: 'GET',
      request: jwtListReq,
    })
  )
  assert('JWT lists org followups', jwtListRes.status === 200 && jwtListRes.body?.followups?.length >= 1)

  const tokenB = signAccessToken({
    userId: actorB.userId,
    tenantId: actorB.orgId,
    role: 'admin',
    perms: [],
  })
  const jwtCrossReq = mockRequest('/followups', {
    headers: { Authorization: `Bearer ${tokenB}` },
  })
  const jwtCrossRes = await readResponse(
    await mobileRoute({
      root: 'followups',
      id: undefined,
      action: undefined,
      segs: ['followups'],
      method: 'GET',
      request: jwtCrossReq,
    })
  )
  const crossIds = (jwtCrossRes.body?.followups || []).map((f) => f.id)
  assert('JWT cross-tenant isolation', !crossIds.includes(followupId))

  // ─── Cookie bridge path (shared handlers) ───
  const cookieListRes = await readResponse(
    await cookieBridgeRoute({
      root: 'followups',
      id: undefined,
      action: undefined,
      segs: ['followups'],
      method: 'GET',
      request: mockRequest('/followups'),
      user: actorA.user,
    })
  )
  assert('Cookie bridge lists same org followups', cookieListRes.status === 200 && cookieListRes.body?.followups?.some((f) => f.id === followupId))

  const cookieCrossRes = await readResponse(
    await cookieBridgeRoute({
      root: 'followups',
      id: undefined,
      action: undefined,
      segs: ['followups'],
      method: 'GET',
      request: mockRequest('/followups'),
      user: actorB.user,
    })
  )
  const cookieCrossIds = (cookieCrossRes.body?.followups || []).map((f) => f.id)
  assert('Cookie bridge cross-tenant isolation', !cookieCrossIds.includes(followupId))

  // ─── Role enforcement ───
  const adminDenied = await readResponse(
    await cookieBridgeRoute({
      root: 'admin',
      id: undefined,
      action: undefined,
      segs: ['admin', 'users'],
      method: 'GET',
      request: mockRequest('/admin/users'),
      user: agentB.user,
    })
  )
  assert('Agent denied admin users', adminDenied.status === 403)

  const adminOk = await readResponse(
    await cookieBridgeRoute({
      root: 'admin',
      id: undefined,
      action: undefined,
      segs: ['admin', 'users'],
      method: 'GET',
      request: mockRequest('/admin/users'),
      user: actorA.user,
    })
  )
  assert('Admin can list users', adminOk.status === 200 && Array.isArray(adminOk.body?.users))

  // ─── Regression: legacy path not blocked ───
  const legacyMobile = await mobileRoute({
    root: 'leads',
    id: undefined,
    action: undefined,
    segs: ['leads'],
    method: 'GET',
    request: mockRequest('/leads'),
  })
  assert('mobileRoute null for leads (cookie legacy)', legacyMobile === null)

  // ─── buildRequestActor from seeded user ───
  const built = buildRequestActor(actorA.user)
  assert('buildRequestActor maps orgId', built?.orgId === actorA.orgId && built?.userId === actorA.userId)

  return failed
}

async function main() {
  console.log('── Dispatch / unit (no Mongo) ──')
  const dispatchFailed = await runDispatchTests()

  const url = process.env.MONGO_URL || 'mongodb://localhost:27017'
  const dbName = process.env.DB_NAME || 'asoftech_saas_test_e002'
  const client = new MongoClient(url, { serverSelectionTimeoutMS: 3000 })

  try {
    await client.connect()
    console.log('\n── Integration (Mongo) ──')
    const integrationFailed = await runIntegrationTests(client.db(dbName))
    if (dispatchFailed || integrationFailed) {
      console.error('\nE-002 bridge tests FAILED')
      process.exit(1)
    }
    console.log('\nE-002 bridge tests PASSED')
  } catch (e) {
    if (e.name === 'MongoServerSelectionError' || e.code === 'ECONNREFUSED') {
      console.warn('\nMongo unavailable — dispatch/unit tests only')
      if (dispatchFailed) {
        console.error('\nE-002 bridge tests FAILED')
        process.exit(1)
      }
      console.log('\nE-002 dispatch tests PASSED (integration skipped — no Mongo)')
      process.exit(0)
    }
    throw e
  } finally {
    try { await client.close() } catch {}
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
