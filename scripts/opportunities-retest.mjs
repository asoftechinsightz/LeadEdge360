/**
 * Opportunities module API retest — run: node scripts/opportunities-retest.mjs
 */
import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')


const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3003/api'
const EMAIL = 'admin@asoftechinsightz.com'
const PASSWORD = 'ChangeMe@2025'

const results = []

function record(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
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

async function verifyMongo(token) {
  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    await request('GET', '/opportunities/pipeline', { token })
    const names = (await db.listCollections().toArray()).map((c) => c.name)
    const required = ['opportunities', 'opportunity_activities', 'leads']
    const missing = required.filter((n) => !names.includes(n))
    record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)
    record('Collections exist', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : required.join(', '))
    const oppCount = await db.collection('opportunities').countDocuments({ orgId: 'demo-org' })
    record('Opportunity seed data', oppCount > 0, `${oppCount} demo-org opportunities`)
    return { client, oppCount }
  } catch (e) {
    record('MongoDB connectivity', false, e.message)
    return { client }
  }
}

async function runTests(token) {
  let oppId = null
  let leadId = null

  const dash = await request('GET', '/opportunities/dashboard', { token })
  record('Pipeline analytics', dash.status === 200 && dash.data?.total != null, `total=${dash.data?.total}`)

  const pipeline = await request('GET', '/opportunities/pipeline', { token })
  record('Pipeline load', pipeline.status === 200 && Array.isArray(pipeline.data?.items), `items=${pipeline.data?.items?.length ?? 0}`)
  leadId = pipeline.data?.items?.[0]?.id
  oppId = pipeline.data?.items?.[0]?.opportunityId

  const create = await request('POST', '/opportunities', {
    token,
    body: { company: 'Opp Test Co', name: 'Standalone Opp', owner: 'Anoop Kumar', expectedValue: 150000 },
  })
  record('Create opportunity', create.status === 201 && create.data?.item?.id, `status=${create.status}`)
  const standaloneId = create.data?.item?.id

  if (standaloneId) {
    const edit = await request('PATCH', `/opportunities/${standaloneId}`, {
      token,
      body: { company: 'Opp Test Co Updated', expectedValue: 175000 },
    })
    record('Edit opportunity', edit.status === 200 && edit.data?.opportunity?.expectedValue === 175000, `status=${edit.status}`)

    const detail = await request('GET', `/opportunities/${standaloneId}`, { token })
    const actCount = detail.data?.activities?.length ?? 0
    record('Timeline history', detail.status === 200 && actCount > 0, `activities=${actCount}`)
  }

  if (leadId) {
    const moveQualified = await request('POST', '/opportunities/move', {
      token,
      body: { leadId, status: 'Qualified', reason: 'Retest move' },
    })
    record('Move stage', moveQualified.status === 200, `status=${moveQualified.status}`)
    oppId = moveQualified.data?.opportunity?.id || oppId

    const moveWon = await request('POST', '/opportunities/move', {
      token,
      body: { leadId, status: 'Won', reason: 'Retest won workflow' },
    })
    record('Won workflow', moveWon.status === 200 && moveWon.data?.opportunity?.stage === 'WON', `stage=${moveWon.data?.opportunity?.stage}`)
    record('Revenue sync', !!moveWon.data?.revenue?.id || moveWon.data?.revenue?.amount != null, `amount=${moveWon.data?.revenue?.amount ?? 'n/a'}`)

    const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db(DB_NAME)
    const revenueCount = await db.collection('revenue').countDocuments({ orgId: 'demo-org', source: 'opportunity_won' })
    await client.close()
    record('Revenue collection', revenueCount > 0, `${revenueCount} won revenue records`)

    const moveLostLead = pipeline.data?.items?.find((i) => i.id !== leadId)?.id
    if (moveLostLead) {
      const moveLost = await request('POST', '/opportunities/move', {
        token,
        body: { leadId: moveLostLead, status: 'Lost', reason: 'Retest lost workflow' },
      })
      record('Lost workflow', moveLost.status === 200 && moveLost.data?.opportunity?.stage === 'LOST', `stage=${moveLost.data?.opportunity?.stage}`)
    } else {
      record('Lost workflow', false, 'no second pipeline lead')
    }
  } else {
    record('Move stage', false, 'no pipeline lead')
    record('Won workflow', false, 'no pipeline lead')
    record('Revenue sync', false, 'no pipeline lead')
    record('Lost workflow', false, 'no pipeline lead')
  }

  if (standaloneId) {
    const del = await request('DELETE', `/opportunities/${standaloneId}`, { token })
    record('Delete opportunity', del.status === 200, `status=${del.status}`)
  }
}

async function main() {
  console.log('\n=== Opportunities Module Retest ===\n')
  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)

  if (!login.data?.accessToken) {
    console.log('\n=== 0 passed (auth failed) ===\n')
    process.exit(1)
  }

  const mongo = await verifyMongo(login.data.accessToken)
  console.log('')
  await runTests(login.data.accessToken)
  if (mongo.client) await mongo.client.close().catch(() => {})

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== ${passed}/${results.length} passed ===\n`)
  process.exit(passed === results.length ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
