/**
 * RC-05 — Security automation (handlers + mongo, no product changes).
 */
import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'
import { signAccessToken } from '../../lib/jwt.js'
import { cookieBridgeRoute, mobileRoute } from '../../lib/mobile-routes.js'
import { mergeUserPreferences } from '../../lib/aeo/preferences-merge.js'
import { isIngestWebhookAllowed } from '../../lib/security-config.js'
import { makeSuite } from './report.mjs'

function mockRequest(path, { headers = {} } = {}) {
  const h = {}
  for (const [k, v] of Object.entries(headers)) h[k.toLowerCase()] = v
  return {
    url: `http://localhost:3000/api${path}`,
    method: 'GET',
    headers: { get: (name) => h[name.toLowerCase()] ?? null },
    json: async () => ({}),
    text: async () => '{}',
    cookies: { get: () => null },
  }
}

async function readResponse(res) {
  if (!res) return { status: 0, body: null }
  const text = await res.text()
  let body = null
  try { body = JSON.parse(text) } catch { body = text }
  return { status: res.status, body }
}

function webhookAllowed(headers, envToken) {
  process.env.N8N_WEBHOOK_TOKEN = envToken
  return isIngestWebhookAllowed({ headers: { get: (n) => headers.get(n) } })
}

export async function runSecurity(db) {
  const suite = makeSuite('security')

  // Preferences validation
  const bad = mergeUserPreferences({}, { aeoProfile: { website: 'not-url' } })
  suite.assert('invalid aeo URL rejected', bad.error != null)

  // Webhook token
  suite.assert('webhook rejects wrong token', !webhookAllowed({ get: () => 'wrong' }, 'secret'))
  suite.assert('webhook accepts correct token', webhookAllowed({ get: () => 'secret' }, 'secret'))

  const orgA = uuid()
  const orgB = uuid()
  const userA = { id: uuid(), orgId: orgA, email: 'sec-a@test.com', role: 'admin', status: 'active' }
  const userB = { id: uuid(), orgId: orgB, email: 'sec-b@test.com', role: 'admin', status: 'active' }
  const agent = { id: uuid(), orgId: orgA, email: 'sec-agent@test.com', role: 'agent', status: 'active' }
  const now = new Date().toISOString()
  await db.collection('orgs').insertMany([
    { id: orgA, name: 'Sec A', createdAt: now },
    { id: orgB, name: 'Sec B', createdAt: now },
  ])
  await db.collection('users').insertMany([userA, userB, agent])

  const fuId = uuid()
  await db.collection('follow_ups').insertOne({
    id: fuId,
    orgId: orgA,
    leadId: uuid(),
    title: 'Sec test',
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'open',
    createdAt: now,
    updatedAt: now,
  })

  const tokenB = signAccessToken({ userId: userB.id, tenantId: orgB, role: 'admin', perms: [] })
  const jwtRes = await readResponse(
    await mobileRoute({
      root: 'followups',
      segs: ['followups'],
      method: 'GET',
      request: mockRequest('/followups', { headers: { Authorization: `Bearer ${tokenB}` } }),
    })
  )
  const ids = (jwtRes.body?.followups || []).map((f) => f.id)
  suite.assert('JWT cross-tenant isolation', !ids.includes(fuId))

  const adminDeny = await readResponse(
    await cookieBridgeRoute({
      root: 'admin',
      segs: ['admin', 'users'],
      method: 'GET',
      request: mockRequest('/admin/users'),
      user: agent,
    })
  )
  suite.assert('agent denied admin', adminDeny.status === 403)

  return suite.summary()
}

export async function runSecurityWithMongo(uri, dbName) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
  await client.connect()
  try {
    return await runSecurity(client.db(dbName))
  } finally {
    await client.close()
  }
}
