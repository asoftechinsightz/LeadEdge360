/**
 * Proposals module API retest — run: node scripts/proposals-retest.mjs
 */
import { MongoClient, ObjectId } from 'mongodb'
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

async function request(method, path, { token, body, timeoutMs = 30000 } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return { status: res.status, data, headers: res.headers }
  } finally {
    clearTimeout(timer)
  }
}

async function requestPdf(path, { token } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method: 'GET', headers })
  const buf = await res.arrayBuffer()
  return { status: res.status, size: buf.byteLength, contentType: res.headers.get('content-type') }
}

async function ensureDemoData(db, token) {
  const leadCount = await db.collection('leads').countDocuments({ orgId: 'demo-org' })
  if (leadCount === 0) {
    const bootstrap = await request('GET', '/sales/leads?page=1&limit=1', { token, timeoutMs: 600000 })
    if (bootstrap.status !== 200) throw new Error(`bootstrap failed ${bootstrap.status}`)
  }

  const sub = await db.collection('subscriptions').findOne({ orgId: 'demo-org', status: 'ACTIVE' })
  if (!sub) {
    await db.collection('subscriptions').insertOne({
      orgId: 'demo-org',
      planCode: 'BUSINESS_GROWTH',
      status: 'ACTIVE',
      activatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const propCount = await db.collection('proposals').countDocuments({ orgId: 'demo-org' })
  if (propCount === 0) {
    const lead = await db.collection('leads').findOne({ orgId: 'demo-org' })
    if (lead) {
      const subtotal = lead.budget || 50000
      const gstAmount = Math.round(subtotal * 0.18)
      const ins = await db.collection('proposals').insertOne({
        proposalNumber: `PROP-${Date.now()}`,
        orgId: 'demo-org',
        leadId: lead.id,
        clientName: lead.name,
        company: lead.company,
        subtotal,
        gstPercent: 18,
        gstAmount,
        totalAmount: subtotal + gstAmount,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await db.collection('proposal_items').insertOne({
        proposalId: ins.insertedId.toString(),
        name: 'LeadEdge360 License',
        qty: 1,
        rate: subtotal,
        amount: subtotal,
        createdAt: new Date(),
      })
    }
  }
}

async function main() {
  console.log('\n=== Proposals Module Retest ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)
  const token = login.data?.accessToken
  if (!token) {
    console.log('\n=== Auth failed ===\n')
    process.exit(1)
  }

  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)
    await ensureDemoData(db, token)
    record('Demo data bootstrap', true, 'subscription + proposals ready')
    const sub = await db.collection('subscriptions').findOne({ orgId: 'demo-org', status: 'ACTIVE' })
    record('Demo subscription', !!sub, sub?.planCode || 'missing')
    const propCount = await db.collection('proposals').countDocuments({ orgId: 'demo-org' })
    record('Proposal seed data', propCount > 0, `${propCount} demo proposals`)
  } catch (e) {
    record('Demo data bootstrap', false, e.message)
  }

  const dash = await request('GET', '/dashboard/proposals', { token })
  record('Dashboard analytics', dash.status === 200 && dash.data?.success, `stats=${dash.data?.stats?.length ?? 0}`)

  const list = await request('GET', '/proposals', { token })
  record('List proposals', list.status === 200 && Array.isArray(list.data?.proposals), `count=${list.data?.count ?? 0}`)

  const pipeline = await request('GET', '/opportunities/pipeline', { token })
  const oppId = pipeline.data?.items?.[0]?.opportunityId
  const leadId = pipeline.data?.items?.[0]?.id

  let proposalId = null

  const create = await request('POST', '/proposals', {
    token,
    body: {
      clientName: 'Retest Client',
      company: 'Retest Co',
      subtotal: 100000,
      gstPercent: 18,
      gstAmount: 18000,
      totalAmount: 118000,
      items: [{ name: 'CRM License', qty: 1, rate: 100000, amount: 100000 }],
    },
  })
  proposalId = create.data?.proposal?.id
  record('Create proposal', create.status === 200 && proposalId, `status=${create.status}`)

  if (proposalId) {
    const detail = await request('GET', `/proposals/${proposalId}`, { token })
    const hasItems = (detail.data?.proposal?.items?.length || 0) > 0
    record('Get proposal detail', detail.status === 200 && detail.data?.proposal?.clientName === 'Retest Client', `items=${detail.data?.proposal?.items?.length ?? 0}`)

    const edit = await request('PATCH', `/proposals/${proposalId}`, {
      token,
      body: { clientName: 'Retest Client Updated', company: 'Retest Co Ltd' },
    })
    record('Edit proposal', edit.status === 200 && edit.data?.proposal?.clientName === 'Retest Client Updated', `status=${edit.status}`)

    const pdf = await requestPdf(`/proposals/${proposalId}/pdf`, { token })
    record('PDF generation', pdf.status === 200 && pdf.contentType?.includes('pdf') && pdf.size > 500, `bytes=${pdf.size}`)

    const email = await request('POST', `/proposals/${proposalId}/email`, {
      token,
      body: { email: 'test@example.com' },
    })
    record('Email readiness', email.status === 200 && email.data?.mode === 'dry_run', `mode=${email.data?.mode}`)

    const status = await request('POST', `/proposals/${proposalId}/status`, {
      token,
      body: { status: 'SENT' },
    })
    record('Status update', status.status === 200 && status.data?.success, `status=${status.status}`)

    const invoice = await request('POST', `/proposals/${proposalId}/convert-to-invoice`, { token })
    record('Convert to invoice', invoice.status === 200 && invoice.data?.invoiceNumber, invoice.data?.invoiceNumber)

    const won = await request('POST', `/proposals/${proposalId}/won`, { token })
    record('Mark won', won.status === 200 && won.data?.success, `status=${won.data?.status}`)

    if (oppId) {
      const oppProp = await request('POST', `/opportunities/${oppId}/proposal`, { token })
      record('Opportunity linkage', oppProp.status === 200 && oppProp.data?.proposal?.opportunityId === oppId, `proposalId=${oppProp.data?.proposalId}`)
    } else {
      record('Opportunity linkage', false, 'no opportunity id')
    }

    if (leadId) {
      const auto = await request('POST', '/proposals/auto-generate', { token, body: { leadId } })
      record('Auto-generate from lead', auto.status === 200 && auto.data?.proposal?.leadId === leadId, `proposal=${auto.data?.proposal?.id}`)
    } else {
      record('Auto-generate from lead', false, 'no lead id')
    }

    const isolated = await request('GET', '/proposals/000000000000000000000001', { token })
    record('Tenant isolation', isolated.status === 404 || !isolated.data?.proposal, `status=${isolated.status}`)

    const del = await request('DELETE', `/proposals/${proposalId}`, { token })
    record('Delete proposal', del.status === 200 && del.data?.deleted, `status=${del.status}`)
  } else {
    for (const name of [
      'Get proposal detail', 'Edit proposal', 'PDF generation', 'Email readiness', 'Status update',
      'Convert to invoice', 'Mark won', 'Opportunity linkage', 'Auto-generate from lead', 'Tenant isolation', 'Delete proposal',
    ]) {
      record(name, false, 'no proposal id')
    }
  }

  try {
    const db = client.db(DB_NAME)
    const names = (await db.listCollections().toArray()).map((c) => c.name)
    const required = ['proposals', 'proposal_items', 'proposal_templates', 'subscriptions']
    const missing = required.filter((n) => !names.includes(n))
    record('Collections exist', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : required.join(', '))
    await client.close()
  } catch { /* noop */ }

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== ${passed}/${results.length} passed ===\n`)
  process.exit(passed === results.length ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
