/**
 * Leads module API retest — run: node scripts/leads-retest.mjs
 * Requires MongoDB at MONGO_URL (default mongodb://127.0.0.1:27017)
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


const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3002/api'
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
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { status: res.status, data }
}

async function verifyMongo(token) {
  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  try {
    await client.connect()
    const db = client.db(DB_NAME)

    // Warm up API so collections + seed are created via getDb()
    await request('GET', '/sales/leads?page=1&limit=1', { token })

    const collections = await db.listCollections().toArray()
    const names = collections.map((c) => c.name)
    const required = ['leads', 'lead_notes', 'lead_timeline', 'lead_assignments', 'lead_status_history', 'follow_ups']
    const missing = required.filter((n) => !names.includes(n))
    record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)
    record('Collections exist', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : required.join(', '))
    const leadCount = await db.collection('leads').countDocuments({ orgId: 'demo-org' })
    record('Seed data present', leadCount > 0, `${leadCount} demo-org leads`)
    return { ok: true, db, client, leadCount }
  } catch (e) {
    record('MongoDB connectivity', false, e.message)
    return { ok: false, client }
  }
}

async function runApiTests(token) {
  let leadId = null

  const list = await request('GET', '/sales/leads?page=1&limit=5', { token })
  record('List leads', list.status === 200 && Array.isArray(list.data?.items), `status=${list.status} count=${list.data?.items?.length ?? 0}`)

  const search = await request('GET', '/sales/leads?page=1&limit=5&q=Rahul', { token })
  const searchHit = search.data?.items?.some((l) => /rahul/i.test(l.name || ''))
  record('Search lead', search.status === 200 && searchHit, `matches=${search.data?.items?.length ?? 0}`)

  const create = await request('POST', '/leads', {
    token,
    body: {
      name: 'Retest Lead',
      phone: '+919911112222',
      email: 'retest@example.com',
      company: 'Retest Co',
      source: 'website',
      territory: 'Bengaluru',
      budget: 50000,
      message: 'Leads stabilization retest',
    },
  })
  record('Create lead', create.status === 201 && create.data?.lead?.id, `status=${create.status}`)
  leadId = create.data?.lead?.id || list.data?.items?.[0]?.id

  if (!leadId) {
    record('Edit lead', false, 'no lead id')
    record('Lead detail', false, 'no lead id')
    return
  }

  const edit = await request('PATCH', `/leads/${leadId}`, {
    token,
    body: { company: 'Retest Co Updated', status: 'Contacted' },
  })
  record('Edit lead', edit.status === 200 && edit.data?.lead?.company === 'Retest Co Updated', `status=${edit.status}`)

  const detail = await request('GET', `/leads/${leadId}`, { token })
  record('Lead detail tabs data', detail.status === 200 && detail.data?.lead?.id === leadId, `status=${detail.status}`)

  const note = await request('POST', `/leads/${leadId}/notes`, { token, body: { note: 'Retest note' } })
  record('Notes', note.status === 201, `status=${note.status}`)

  const follow = await request('POST', `/leads/${leadId}/followups`, {
    token,
    body: { title: 'Retest follow-up', dueAt: '2026-07-01T10:00:00' },
  })
  record('Follow-ups', follow.status === 201, `status=${follow.status}`)

  const assign = await request('POST', `/leads/${leadId}/assign`, { token, body: { assignedTo: 'Priya Iyer' } })
  record('Assignment action', assign.status === 200, `status=${assign.status}`)

  const assignments = await request('GET', `/leads/${leadId}/assignments`, { token })
  const assignCount = assignments.data?.assignments?.length ?? 0
  record('Assignment history', assignments.status === 200 && assignCount > 0, `records=${assignCount}`)

  const status = await request('POST', `/leads/${leadId}/status`, {
    token,
    body: { status: 'Qualified', reason: 'Retest status change' },
  })
  record('Status change', status.status === 200, `status=${status.status}`)

  const history = await request('GET', `/leads/${leadId}/status-history`, { token })
  const historyCount = history.data?.history?.length ?? 0
  record('Status history', history.status === 200 && historyCount > 0, `records=${historyCount}`)

  const timeline = await request('GET', `/leads/${leadId}/timeline`, { token })
  const timelineCount = timeline.data?.timeline?.length ?? 0
  record('Timeline', timeline.status === 200 && timelineCount > 0, `events=${timelineCount}`)

  await request('DELETE', `/leads/${leadId}`, { token })
}

async function main() {
  console.log('\n=== Leads Stabilization Retest ===\n')
  console.log(`API: ${BASE}`)
  console.log(`MONGO_URL: ${MONGO_URL}`)
  console.log(`DB_NAME: ${DB_NAME}\n`)

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)

  if (login.data?.accessToken) {
    const mongo = await verifyMongo(login.data.accessToken)
    console.log('')
    await runApiTests(login.data.accessToken)
    if (mongo.client) await mongo.client.close().catch(() => {})
  } else {
    record('API tests', false, 'skipped — no token')
  }

  const passed = results.filter((r) => r.pass).length
  const total = results.length
  console.log(`\n=== ${passed}/${total} passed ===\n`)
  process.exit(passed === total ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
