/**
 * Sprint 4 — WhatsApp + AI API retest
 * Run: npm run dev -- --port 3007 && npm run db:sprint4-retest
 */
import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

process.env.REQUIRE_AUTH = 'true'

const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3007/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'
const TEST_ORG = 'demo-org'

const results = []
let authToken = null
let threadId = null
let leadId = null
let cardSlug = null

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, path, { token, body } = {}) {
  const h = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { status: res.status, data }
}

async function main() {
  console.log('\n=== SPRINT 4 RETEST (WhatsApp + AI) ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  authToken = login.data?.accessToken
  record('Login', login.status === 200 && !!authToken)
  if (!authToken) process.exit(1)

  try {
    const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db(DB_NAME)
    await db.collection('subscriptions').updateOne(
      { orgId: TEST_ORG, status: 'ACTIVE' },
      { $set: { orgId: TEST_ORG, planCode: 'BUSINESS_GROWTH', status: 'ACTIVE', activatedAt: new Date() } },
      { upsert: true },
    )

    leadId = randomUUID()
    await db.collection('leads').updateOne(
      { orgId: TEST_ORG, id: leadId },
      {
        $set: {
          orgId: TEST_ORG,
          id: leadId,
          name: 'Sprint4 Test Lead',
          company: 'Retest Co',
          phone: '919876543210',
          email: 'sprint4@test.com',
          source: 'whatsapp',
          message: 'Need a demo ASAP',
          status: 'new',
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    const card = await db.collection('business_cards').findOne({ orgId: TEST_ORG, published: true })
    cardSlug = card?.slug || null

    await client.close()
    record('Bootstrap subscription + lead', true)
  } catch (err) {
    record('Bootstrap subscription + lead', false, err.message)
  }

  const features = await request('GET', '/users/features', { token: authToken })
  const feats = features.data?.data?.features || []
  record('Feature whatsapp_pro', feats.includes('whatsapp_pro'))
  record('Feature ai_assistant', feats.includes('ai_assistant'))

  const create = await request('POST', '/whatsapp/threads', {
    token: authToken,
    body: {
      contactPhone: '919999888877',
      contactName: 'WA Test',
      text: 'Hello from retest',
      leadId,
    },
  })
  threadId = create.data?.data?.thread?.id
  record('POST /whatsapp/threads (send)', create.status === 201 && !!threadId)

  const list = await request('GET', '/whatsapp/threads', { token: authToken })
  record('GET /whatsapp/threads', list.status === 200 && list.data?.items?.length > 0)

  if (!threadId) process.exit(1)

  const msgs = await request('GET', `/whatsapp/threads/${threadId}/messages`, { token: authToken })
  record('GET thread messages', msgs.status === 200 && msgs.data?.messages?.length > 0)

  const reply = await request('POST', `/whatsapp/threads/${threadId}/messages`, {
    token: authToken,
    body: { text: 'Follow-up reply' },
  })
  record('POST thread message', reply.status === 201 && reply.data?.data?.message?.body)

  const suggest = await request('POST', '/ai/suggest', {
    token: authToken,
    body: { leadId, intent: 'followup' },
  })
  record('POST /ai/suggest', suggest.status === 200 && suggest.data?.data?.suggestion)

  if (leadId) {
    const score = await request('POST', '/ai/score', { token: authToken, body: { leadId } })
    record('POST /ai/score', score.status === 200 && typeof score.data?.data?.score === 'number')
  } else {
    record('POST /ai/score', false, 'no leadId')
  }

  if (cardSlug) {
    const click = await request('POST', `/public/card/${cardSlug}/click`, { body: { channel: 'whatsapp' } })
    record('POST /public/card/:slug/click', click.status === 200)
  } else {
    record('POST /public/card/:slug/click', true, 'skipped — no published card')
  }

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== SUMMARY: ${passed}/${results.length} PASS ===\n`)
  process.exit(passed < results.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
