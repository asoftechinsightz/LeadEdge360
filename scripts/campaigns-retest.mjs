/**
 * Campaigns module API retest — run: node scripts/campaigns-retest.mjs
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


const BASE = process.env.RETEST_API_BASE || 'http://127.0.0.1:3005/api'
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

async function main() {
  console.log('\n=== Campaigns Module Retest ===\n')

  const login = await request('POST', '/auth/login-password', { body: { email: EMAIL, password: PASSWORD } })
  record('Auth login', login.status === 200 && login.data?.accessToken, `status=${login.status}`)
  const token = login.data?.accessToken
  if (!token) {
    console.log('\n=== Auth failed ===\n')
    process.exit(1)
  }

  // Mongo connectivity
  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
  try {
    await client.connect()
    await request('GET', '/campaigns?page=1&limit=5', { token })
    const db = client.db(DB_NAME)
    record('MongoDB connectivity', true, `${MONGO_URL} / ${DB_NAME}`)
    const campCount = await db.collection('campaigns').countDocuments({ orgId: 'demo-org' })
    record('Campaign seed data', campCount > 0, `${campCount} demo campaigns`)
  } catch (e) {
    record('MongoDB connectivity', false, e.message)
  }

  const smtp = await request('GET', '/campaigns/smtp/readiness', { token })
  record('SMTP readiness', smtp.status === 200 && smtp.data?.mode, `mode=${smtp.data?.mode} ready=${smtp.data?.ready}`)

  // Get a lead for audience
  const leads = await request('GET', '/sales/leads?page=1&limit=3', { token })
  const leadIds = (leads.data?.items || []).slice(0, 2).map((l) => l.id)
  const leadId = leadIds[0]

  // Get or create template
  let templateId = null
  const templates = await request('GET', '/templates/email?page=1&limit=5', { token })
  templateId = templates.data?.items?.[0]?.id
  if (!templateId) {
    const tCreate = await request('POST', '/templates/email', {
      token,
      body: {
        name: 'Retest Template',
        subject: 'Hello {{name}}',
        body: '<p>Hi {{name}} from {{company}} in {{city}}</p>',
      },
    })
    templateId = tCreate.data?.template?.id
  }

  const render = await request('POST', '/campaigns/render', {
    token,
    body: { templateId, leadId },
  })
  const renderedName = render.data?.rendered?.subject?.includes('Hello') && !render.data?.rendered?.subject?.includes('{{name}}')
  record('Template rendering', render.status === 200 && renderedName, render.data?.rendered?.subject)

  const create = await request('POST', '/campaigns', {
    token,
    body: {
      name: 'Retest Campaign',
      channel: 'email',
      audience: { leadIds },
      templateId,
      createdBy: 'retest',
    },
  })
  const campaignId = create.data?.campaign?.id
  record('Create campaign', create.status === 200 && campaignId, `status=${create.status}`)

  if (campaignId) {
    const edit = await request('PUT', `/campaigns/${campaignId}`, {
      token,
      body: { name: 'Retest Campaign Updated' },
    })
    record('Edit campaign', edit.status === 200 && edit.data?.campaign?.name === 'Retest Campaign Updated', `status=${edit.status}`)

    const activitiesBefore = await request('GET', `/campaigns/${campaignId}/activities`, { token })
    record('Activity history', activitiesBefore.status === 200 && (activitiesBefore.data?.items?.length || 0) > 0, `events=${activitiesBefore.data?.items?.length ?? 0}`)

    if (templateId) {
      await request('PUT', `/campaigns/${campaignId}/template`, { token, body: { templateId } })
    }

    const exec = await request('POST', `/campaigns/${campaignId}/execute`, { token })
    record('Execute campaign', exec.status === 200 && exec.data?.executionId, `leads=${exec.data?.totalLeads} mode=${exec.data?.smtpMode}`)

    try {
      const db = client.db(DB_NAME)
      const names = (await db.listCollections().toArray()).map((c) => c.name)
      const required = ['campaigns', 'campaign_executions', 'campaign_messages', 'campaign_activities', 'email_templates']
      const missing = required.filter((n) => !names.includes(n))
      record('Collections exist', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : required.join(', '))
    } catch (e) {
      record('Collections exist', false, e.message)
    }

    const analytics = await request('GET', '/campaigns/analytics', { token })
    record('Analytics tracking', analytics.status === 200 && analytics.data?.totalExecutions > 0, `executions=${analytics.data?.totalExecutions}`)

    const detailAnalytics = await request('GET', `/campaigns/${campaignId}/analytics`, { token })
    record('Campaign analytics detail', detailAnalytics.status === 200 && detailAnalytics.data?.totalMessages > 0, `messages=${detailAnalytics.data?.totalMessages}`)

    if (leadId) {
      const client2 = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 5000 })
      await client2.connect()
      const lead = await client2.db(DB_NAME).collection('leads').findOne({ id: leadId, orgId: 'demo-org' })
      await client2.close()
      record('Lead assignment', lead?.campaignId === campaignId, `campaignId=${lead?.campaignId}`)
    } else {
      record('Lead assignment', false, 'no lead id')
    }

    // Tenant isolation — fake campaign id should not return data
    const isolated = await request('GET', '/campaigns/00000000-0000-0000-0000-000000000099', { token })
    record('Tenant isolation', isolated.status === 200 && !isolated.data?.campaign, `campaign=${isolated.data?.campaign}`)

    const del = await request('DELETE', `/campaigns/${campaignId}`, { token })
    record('Delete campaign', del.status === 200 && del.data?.deleted, `status=${del.status}`)
  } else {
    record('Edit campaign', false, 'no campaign id')
    record('Activity history', false, 'no campaign id')
    record('Execute campaign', false, 'no campaign id')
    record('Collections exist', false, 'no campaign id')
    record('Analytics tracking', false, 'no campaign id')
    record('Campaign analytics detail', false, 'no campaign id')
    record('Lead assignment', false, 'no campaign id')
    record('Tenant isolation', false, 'no campaign id')
    record('Delete campaign', false, 'no campaign id')
  }

  try { await client.close() } catch { /* noop */ }

  const passed = results.filter((r) => r.pass).length
  console.log(`\n=== ${passed}/${results.length} passed ===\n`)
  process.exit(passed === results.length ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
