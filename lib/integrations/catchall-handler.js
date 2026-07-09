import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import {
  listIntegrationsForOrg,
  getIntegrationHealthDashboard,
  getIntegrationAuditTrail,
  connectIntegration,
  disconnectIntegration,
  testIntegrationConnection,
  syncIntegration,
  completeOAuthCallback,
  verifyIntegrationWebhook,
  getOrgIntegrationCredentials,
} from './service.js'
import { getIntegrationDef } from './registry.js'
import { getOrgIntegration } from './store.js'
import { getDb } from '@/lib/mongo'
import { INTEGRATION_ADMIN_ROLES } from './api-helpers.js'
import { buildTenantWebhookUrl } from './urls.js'
import { runScheduledSyncs } from './sync-scheduler.js'
import { runHealthChecksAllTenants } from './health.js'

const json = (data, status = 200) => NextResponse.json({ success: true, ...data }, { status })
const fail = (message, status = 500) => NextResponse.json({ success: false, error: message }, { status })

function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function guardRead(tenant) {
  if (!tenant?.user) throw Object.assign(new Error('UNAUTHORIZED'), { status: 401 })
  requireRole(tenant.user, null, 'crm')
  return tenant
}

function guardAdmin(tenant) {
  guardRead(tenant)
  requireRole(tenant.user, INTEGRATION_ADMIN_ROLES)
  return tenant
}

/**
 * Handle /api/integrations/* via catch-all router (fallback when App Router files missing from build).
 * segs: ['integrations'], ['integrations','health'], ['integrations','whatsapp','connect'], etc.
 */
export async function handleIntegrationsCatchall({ method, segs, request, tenant }) {
  const [, id, action, fourth] = segs
  const root = segs[0]
  if (root !== 'integrations') return null

  // OAuth callback — public
  if (id === 'oauth' && action === 'callback' && method === 'GET') {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const oauthError = url.searchParams.get('error')
    const settingsPath = '/settings?tab=integrations'
    if (oauthError) {
      return NextResponse.redirect(`${settingsPath}&oauth=error&reason=${encodeURIComponent(oauthError)}`)
    }
    if (!code || !state) {
      return NextResponse.redirect(`${settingsPath}&oauth=error&reason=missing_params`)
    }
    try {
      const result = await completeOAuthCallback({ state, code })
      const q = result.status === 'connected' ? 'success' : 'error'
      return NextResponse.redirect(`${settingsPath}&oauth=${q}&integration=${result.integrationId}`)
    } catch (e) {
      return NextResponse.redirect(`${settingsPath}&oauth=error&reason=${encodeURIComponent(e.message)}`)
    }
  }

  // Webhooks — orgId in query
  if (id === 'webhooks' && action && method === 'POST') {
    const integrationId = action
    const url = new URL(request.url)
    const orgId = url.searchParams.get('orgId')
    if (!orgId) return fail('ORG_ID_REQUIRED', 400)
    const rawBody = await request.text()
    const verification = await verifyIntegrationWebhook(integrationId, orgId, rawBody, request.headers)
    if (!verification.ok) {
      return NextResponse.json({ success: false, error: 'WEBHOOK_VERIFICATION_FAILED', reason: verification.reason }, { status: 401 })
    }
    let payload = {}
    try { payload = rawBody ? JSON.parse(rawBody) : {} } catch { payload = { raw: rawBody.slice(0, 500) } }
    return json({ received: true, integrationId, orgId, eventType: payload.event || payload.object || 'unknown' })
  }

  if (id === 'webhooks' && action && method === 'GET') {
    const integrationId = action
    const url = new URL(request.url)
    const mode = url.searchParams.get('hub.mode')
    const challenge = url.searchParams.get('hub.challenge')
    const verifyToken = url.searchParams.get('hub.verify_token')
    const orgId = url.searchParams.get('orgId')
    if (integrationId === 'whatsapp' && mode === 'subscribe' && challenge) {
      const creds = orgId ? await getOrgIntegrationCredentials(orgId, 'whatsapp') : null
      const expected = creds?.credentials?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN
      if (expected && verifyToken === expected) return new NextResponse(challenge, { status: 200 })
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }
    return json({ ok: true, integrationId })
  }

  // Scheduler — cron secret
  if (id === 'scheduler' && action === 'run' && method === 'POST') {
    const cronSecret = process.env.INTEGRATION_CRON_SECRET || process.env.CRON_SECRET || ''
    const auth = request.headers.get('authorization') || ''
    const authorized = !cronSecret
      ? process.env.NODE_ENV !== 'production'
      : auth === `Bearer ${cronSecret}` || request.headers.get('x-cron-secret') === cronSecret
    if (!authorized) return fail('UNAUTHORIZED', 401)
    const url = new URL(request.url)
    const task = url.searchParams.get('task') || 'sync'
    const orgId = url.searchParams.get('orgId') || null
    if (task === 'health') {
      const results = await runHealthChecksAllTenants()
      return json({ task: 'health', results })
    }
    const result = await runScheduledSyncs({ orgId, force: url.searchParams.get('force') === '1' })
    return json({ task: 'sync', ...result })
  }

  const t = guardRead(tenant)
  const { orgId, user } = t

  if (!id && method === 'GET') {
    const integrations = await listIntegrationsForOrg(orgId)
    return json({ integrations })
  }

  if (id === 'health' && method === 'GET') {
    const dashboard = await getIntegrationHealthDashboard(orgId)
    return json(dashboard)
  }

  if (id === 'audit' && method === 'GET') {
    const url = new URL(request.url)
    const integrationId = url.searchParams.get('integrationId') || undefined
    const limit = Number(url.searchParams.get('limit') || 50)
    const logs = await getIntegrationAuditTrail(orgId, { integrationId, limit })
    return json({ logs })
  }

  const integrationId = id
  const def = getIntegrationDef(integrationId)
  if (!def) return null

  if (!action && method === 'GET') {
    const db = await getDb()
    const record = await getOrgIntegration(db, orgId, integrationId)
    const creds = await getOrgIntegrationCredentials(orgId, integrationId)
    return json({
      integration: {
        ...def,
        status: record?.status || 'disconnected',
        connectedAt: record?.connectedAt,
        lastSyncAt: record?.lastSyncAt,
        health: record?.health,
        metadata: record?.metadata || {},
        credentials: creds?.redacted || null,
      },
    })
  }

  if (['connect', 'disconnect', 'test', 'sync'].includes(action)) {
    guardAdmin(t)
    const ip = clientIp(request)

    if (action === 'connect' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const result = await connectIntegration({
        orgId,
        integrationId,
        credentials: body.credentials || body,
        mode: body.mode || 'api_key',
        user,
        ip,
      })
      return json({ ...result, webhookUrl: buildTenantWebhookUrl(integrationId, orgId) })
    }

    if (action === 'disconnect' && (method === 'POST' || method === 'DELETE')) {
      const result = await disconnectIntegration({ orgId, integrationId, user, ip })
      return json(result)
    }

    if (action === 'test' && method === 'POST') {
      const result = await testIntegrationConnection({ orgId, integrationId, user, ip })
      return json({ result })
    }

    if (action === 'sync' && method === 'POST') {
      const result = await syncIntegration({ orgId, integrationId, user, ip })
      return json({ result })
    }
  }

  return null
}
