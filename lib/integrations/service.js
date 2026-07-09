import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { INTEGRATIONS, getIntegrationDef, AUTH_TYPES } from './registry.js'
import { getConnector } from './connectors/index.js'
import {
  listOrgIntegrations,
  getOrgIntegration,
  getDecryptedCredentials,
  upsertOrgIntegration,
  clearIntegrationCredentials,
  recordSyncJob,
  updateHealth,
  ensureIntegrationIndexes,
} from './store.js'
import { logIntegrationAudit, ensureAuditIndexes, listIntegrationAudit } from './audit.js'
import { redactCredentials } from './crypto.js'
import { buildTenantWebhookUrl } from './urls.js'
import {
  buildIntegrationOAuthUrl,
  exchangeIntegrationOAuthCode,
  isOAuthConfiguredFor,
  providerLabel,
} from './oauth-router.js'

function defaultHealth() {
  return {
    apiStatus: 'unknown',
    webhookStatus: 'unknown',
    lastCheckAt: null,
    lastError: null,
    uptimePercent: 100,
  }
}

function oauthRedirectUri() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.PUBLIC_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/integrations/oauth/callback`
}

export async function ensureIntegrationCollections(db) {
  await ensureIntegrationIndexes(db)
  await ensureAuditIndexes(db)
  await db.collection('integration_sync_jobs').createIndex(
    { orgId: 1, integrationId: 1, createdAt: -1 },
    { name: 'integration_sync_jobs_org_integration_created' },
  )
}

export async function listIntegrationsForOrg(orgId) {
  const db = await getDb()
  await ensureIntegrationCollections(db)
  const records = await listOrgIntegrations(db, orgId)
  const byId = Object.fromEntries(records.map((r) => [r.integrationId, r]))

  return INTEGRATIONS.map((def) => {
    const record = byId[def.id]
    return {
      ...def,
      status: record?.status || 'disconnected',
      connectedAt: record?.connectedAt || null,
      lastSyncAt: record?.lastSyncAt || null,
      lastSyncStatus: record?.lastSyncStatus || null,
      health: record?.health || defaultHealth(),
      metadata: record?.metadata || {},
      webhookUrl: buildTenantWebhookUrl(def.id, orgId),
      canConfigure: def.implemented,
    }
  })
}

export async function getIntegrationHealthDashboard(orgId) {
  const items = await listIntegrationsForOrg(orgId)
  const connected = items.filter((i) => i.status === 'connected').length
  const degraded = items.filter((i) => i.health?.apiStatus === 'degraded' || i.health?.apiStatus === 'down').length
  return {
    summary: {
      total: items.length,
      connected,
      disconnected: items.length - connected,
      degraded,
      implemented: items.filter((i) => i.implemented).length,
    },
    integrations: items,
  }
}

export async function connectIntegration({
  orgId,
  integrationId,
  credentials,
  user,
  ip,
  mode = 'api_key',
}) {
  const def = getIntegrationDef(integrationId)
  if (!def) throw Object.assign(new Error('NOT_FOUND'), { detail: 'Unknown integration' })
  if (!def.implemented) throw Object.assign(new Error('VALIDATION_FAILED'), { detail: `Phase ${def.phase} — not yet available` })

  const db = await getDb()
  await ensureIntegrationCollections(db)
  const connector = getConnector(integrationId)

  if (def.authType === AUTH_TYPES.OAUTH2 || (mode === 'oauth' && def.authType !== AUTH_TYPES.API_KEY)) {
    const state = randomUUID()
    if (!isOAuthConfiguredFor(integrationId)) {
      throw Object.assign(new Error('VALIDATION_FAILED'), {
        detail: `${providerLabel(integrationId)} OAuth not configured on server`,
      })
    }
    const oauthUrl = buildIntegrationOAuthUrl(integrationId, {
      redirectUri: oauthRedirectUri(),
      state,
    })
    if (!oauthUrl) {
      throw Object.assign(new Error('VALIDATION_FAILED'), { detail: 'OAuth not supported for this integration' })
    }

    await upsertOrgIntegration(db, orgId, integrationId, {
      status: 'pending_oauth',
      oauthState: state,
      metadata: { initiatedBy: user?.email },
    })
    await logIntegrationAudit(db, {
      orgId,
      integrationId,
      action: 'connect.oauth_initiated',
      userId: user?.id,
      userEmail: user?.email,
      ip,
    })
    return { oauthUrl, state }
  }

  const validation = connector.validateCredentials(credentials)
  if (!validation.ok) throw Object.assign(new Error('VALIDATION_FAILED'), { detail: validation.error })

  const test = await connector.testConnection(credentials)
  const now = new Date().toISOString()
  await upsertOrgIntegration(db, orgId, integrationId, {
    credentials,
    status: test.ok ? 'connected' : 'error',
    connectedAt: test.ok ? now : null,
    connectedBy: user?.email,
    metadata: { ...(test.metadata || {}), accountLabel: credentials.accountLabel || def.name },
    health: {
      apiStatus: test.healthy ? 'healthy' : 'down',
      webhookStatus: credentials.webhookSecret ? 'healthy' : 'unknown',
      lastCheckAt: now,
      lastError: test.ok ? null : test.message,
      uptimePercent: test.ok ? 100 : 0,
    },
  })
  await logIntegrationAudit(db, {
    orgId,
    integrationId,
    action: test.ok ? 'connect.success' : 'connect.failed',
    userId: user?.id,
    userEmail: user?.email,
    detail: test.message,
    ip,
  })
  return { status: test.ok ? 'connected' : 'error', message: test.message }
}

export async function completeOAuthCallback({ state, code }) {
  const db = await getDb()
  const record = await db.collection('org_integrations').findOne({ oauthState: state })
  if (!record) throw Object.assign(new Error('NOT_FOUND'), { detail: 'Invalid OAuth state' })

  const { orgId, integrationId } = record
  const def = getIntegrationDef(integrationId)
  const tokens = await exchangeIntegrationOAuthCode(integrationId, code, oauthRedirectUri())

  const connector = getConnector(integrationId)
  const creds = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    scope: tokens.scope,
  }
  const test = await connector.testConnection(creds)
  const now = new Date().toISOString()

  await upsertOrgIntegration(db, orgId, integrationId, {
    credentials: test.refreshedCredentials || creds,
    status: test.ok ? 'connected' : 'error',
    connectedAt: test.ok ? now : null,
    metadata: { ...(test.metadata || {}), accountLabel: test.metadata?.email || def.name },
    oauthState: null,
    health: {
      apiStatus: test.healthy ? 'healthy' : 'down',
      webhookStatus: 'unknown',
      lastCheckAt: now,
      lastError: test.ok ? null : test.message,
      uptimePercent: test.ok ? 100 : 0,
    },
  })
  await logIntegrationAudit(db, {
    orgId,
    integrationId,
    action: test.ok ? 'connect.oauth_success' : 'connect.oauth_failed',
    detail: test.message,
  })
  return { orgId, integrationId, status: test.ok ? 'connected' : 'error', message: test.message }
}

export async function disconnectIntegration({ orgId, integrationId, user, ip }) {
  const db = await getDb()
  await clearIntegrationCredentials(db, orgId, integrationId)
  await logIntegrationAudit(db, {
    orgId,
    integrationId,
    action: 'disconnect',
    userId: user?.id,
    userEmail: user?.email,
    ip,
  })
  return { status: 'disconnected' }
}

export async function testIntegrationConnection({ orgId, integrationId, user, ip }) {
  const db = await getDb()
  const record = await getOrgIntegration(db, orgId, integrationId)
  if (!record || record.status === 'disconnected') {
    throw Object.assign(new Error('NOT_FOUND'), { detail: 'Integration not connected' })
  }
  const creds = await getDecryptedCredentials(record)
  const connector = getConnector(integrationId)
  const result = await connector.testConnection(creds)
  const now = new Date().toISOString()

  if (result.refreshedCredentials) {
    await upsertOrgIntegration(db, orgId, integrationId, { credentials: result.refreshedCredentials })
  }
  await updateHealth(db, orgId, integrationId, {
    apiStatus: result.healthy ? 'healthy' : 'down',
    webhookStatus: record.health?.webhookStatus || 'unknown',
    lastCheckAt: now,
    lastError: result.ok ? null : result.message,
    uptimePercent: result.ok ? 100 : 0,
  })
  await logIntegrationAudit(db, {
    orgId,
    integrationId,
    action: result.ok ? 'test.success' : 'test.failed',
    userId: user?.id,
    userEmail: user?.email,
    detail: result.message,
    ip,
  })
  return result
}

export async function syncIntegration({ orgId, integrationId, user, ip }) {
  const db = await getDb()
  const record = await getOrgIntegration(db, orgId, integrationId)
  if (!record || !['connected', 'error'].includes(record.status)) {
    throw Object.assign(new Error('NOT_FOUND'), { detail: 'Integration not connected' })
  }
  const def = getIntegrationDef(integrationId)
  if (!def?.implemented) {
    throw Object.assign(new Error('VALIDATION_FAILED'), { detail: 'Integration not implemented' })
  }

  const creds = await getDecryptedCredentials(record)
  const connector = getConnector(integrationId)
  const jobId = randomUUID()
  const startedAt = new Date().toISOString()

  await upsertOrgIntegration(db, orgId, integrationId, { status: 'syncing' })
  await recordSyncJob(db, { id: jobId, orgId, integrationId, status: 'running', startedAt })

  let result
  try {
    result = await connector.syncData(creds, record.metadata, { orgId, db })
    if (result.refreshedCredentials) {
      await upsertOrgIntegration(db, orgId, integrationId, { credentials: result.refreshedCredentials })
    }
  } catch (e) {
    result = { ok: false, recordsSynced: 0, message: e.message }
  }

  const completedAt = new Date().toISOString()
  await recordSyncJob(db, {
    id: jobId,
    orgId,
    integrationId,
    status: result.ok ? 'completed' : 'failed',
    startedAt,
    completedAt,
    recordsSynced: result.recordsSynced || 0,
    error: result.ok ? null : result.message,
  })

  await upsertOrgIntegration(db, orgId, integrationId, {
    status: result.ok ? 'connected' : 'error',
    lastSyncAt: completedAt,
    lastSyncStatus: result.ok ? 'success' : 'failed',
    lastSyncError: result.ok ? null : result.message,
    health: {
      apiStatus: result.ok ? 'healthy' : 'degraded',
      webhookStatus: record.health?.webhookStatus || 'unknown',
      lastCheckAt: completedAt,
      lastError: result.ok ? null : result.message,
      uptimePercent: result.ok ? 100 : 50,
    },
  })
  await logIntegrationAudit(db, {
    orgId,
    integrationId,
    action: result.ok ? 'sync.success' : 'sync.failed',
    userId: user?.id,
    userEmail: user?.email,
    detail: result.message,
    ip,
  })
  return result
}

export async function verifyIntegrationWebhook(integrationId, orgId, rawBody, headers) {
  const db = await getDb()
  const record = await getOrgIntegration(db, orgId, integrationId)
  if (!record) return { ok: false, reason: 'integration_not_found' }
  const creds = await getDecryptedCredentials(record)
  const connector = getConnector(integrationId)
  if (!connector?.verifyWebhook) return { ok: false, reason: 'no_verifier' }
  const result = connector.verifyWebhook(rawBody, headers, creds)
  const now = new Date().toISOString()
  await updateHealth(db, orgId, integrationId, {
    ...record.health,
    webhookStatus: result.ok ? 'healthy' : 'down',
    lastCheckAt: now,
    lastError: result.ok ? null : result.reason,
  })
  await logIntegrationAudit(db, {
    orgId,
    integrationId,
    action: result.ok ? 'webhook.verified' : 'webhook.rejected',
    detail: result.reason,
  })
  return result
}

export async function getIntegrationAuditTrail(orgId, options) {
  const db = await getDb()
  return listIntegrationAudit(db, orgId, options)
}

export async function getOrgIntegrationCredentials(orgId, integrationId) {
  const db = await getDb()
  const record = await getOrgIntegration(db, orgId, integrationId)
  if (!record || record.status !== 'connected') return null
  const creds = await getDecryptedCredentials(record)
  return { record, credentials: creds, redacted: redactCredentials(creds) }
}
