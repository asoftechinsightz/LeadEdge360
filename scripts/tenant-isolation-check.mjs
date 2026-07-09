/**
 * Sprint 0 — Tenant isolation verification.
 * Usage: RETEST_API_BASE=http://127.0.0.1:3007/api node scripts/tenant-isolation-check.mjs
 */
import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

process.env.REQUIRE_AUTH = 'true'

const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

const ORG_A = 'tenant-iso-a'
const ORG_B = 'tenant-iso-b'
const USER_A = 'user-iso-a'
const USER_B = 'user-iso-b'
const LEAD_A = `iso-lead-a-${randomUUID()}`
const LEAD_B = `iso-lead-b-${randomUUID()}`

const results = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function sign(userId, orgId, role = 'admin') {
  return jwt.sign({ sub: userId, tenantId: orgId, role, perms: [] }, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'asoftechinsightz',
  })
}

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

async function seed(db) {
  const now = new Date().toISOString()
  for (const [orgId, userId, email, leadId, company] of [
    [ORG_A, USER_A, 'iso-a@test.local', LEAD_A, 'Company A'],
    [ORG_B, USER_B, 'iso-b@test.local', LEAD_B, 'Company B'],
  ]) {
    await db.collection('orgs').updateOne(
      { id: orgId },
      { $set: { id: orgId, name: orgId, plan: 'growth', createdAt: now } },
      { upsert: true },
    )
    await db.collection('users').updateOne(
      { id: userId },
      {
        $set: {
          id: userId,
          orgId,
          email,
          role: 'admin',
          status: 'active',
          products: ['leadedge360'],
          createdAt: now,
        },
      },
      { upsert: true },
    )
    await db.collection('subscriptions').updateOne(
      { orgId, status: 'ACTIVE' },
      { $set: { orgId, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', activatedAt: new Date() } },
      { upsert: true },
    )
    await db.collection('leads').updateOne(
      { id: leadId },
      {
        $set: {
          id: leadId,
          orgId,
          name: 'Isolation Test',
          company,
          status: 'NEW',
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    )
  }
}

async function main() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  const db = client.db(DB_NAME)
  await seed(db)
  await client.close()

  const tokenA = sign(USER_A, ORG_A)
  const tokenB = sign(USER_B, ORG_B)

  const checks = [
    ['GET /leads — tenant A sees own lead', async () => {
      const res = await request('GET', '/leads', { token: tokenA })
      const items = res.data?.items || res.data?.leads || []
      return res.status === 200 && items.some((l) => l.id === LEAD_A) && !items.some((l) => l.id === LEAD_B)
    }],
    ['GET /leads/:id — tenant B blocked from tenant A lead', async () => {
      const res = await request('GET', `/leads/${LEAD_A}`, { token: tokenB })
      return res.status === 404 || res.status === 403
    }],
    ['GET /analytics/summary — scoped counts', async () => {
      const res = await request('GET', '/analytics/summary', { token: tokenA })
      return res.status === 200 && res.data?.orgId === ORG_A
    }],
    ['GET /lead-scoring/priority — tenant scoped', async () => {
      const res = await request('GET', '/lead-scoring/priority', { token: tokenA })
      return res.status === 200 && res.data?.orgId === ORG_A
    }],
    ['GET /customers — requires auth', async () => {
      const res = await request('GET', '/customers')
      return res.status === 401
    }],
  ]

  for (const [name, fn] of checks) {
    try {
      const pass = await fn()
      record(name, pass)
    } catch (err) {
      record(name, false, err.message)
    }
  }

  const failed = results.filter((r) => !r.pass).length
  console.log(`\n[tenant-isolation] ${results.length - failed}/${results.length} PASS`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[tenant-isolation] fatal:', err.message)
  process.exit(1)
})
