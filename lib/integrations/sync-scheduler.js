import { getDb } from '@/lib/mongo'
import { syncIntegration } from './service.js'

const SYNC_INTERVAL_MS = Number(process.env.INTEGRATION_SYNC_INTERVAL_MS || 6 * 60 * 60 * 1000)

/** Run background sync for all connected integrations due for refresh. */
export async function runScheduledSyncs({ orgId = null, force = false } = {}) {
  const db = await getDb()
  const filter = { status: 'connected' }
  if (orgId) filter.orgId = orgId

  const records = await db.collection('org_integrations').find(filter).toArray()
  const now = Date.now()
  const results = []

  for (const record of records) {
    const lastSync = record.lastSyncAt ? new Date(record.lastSyncAt).getTime() : 0
    if (!force && now - lastSync < SYNC_INTERVAL_MS) continue

    try {
      const r = await syncIntegration({
        orgId: record.orgId,
        integrationId: record.integrationId,
        user: { email: 'system@scheduler' },
        ip: 'scheduler',
      })
      results.push({ orgId: record.orgId, integrationId: record.integrationId, ok: r.ok, message: r.message })
    } catch (e) {
      results.push({ orgId: record.orgId, integrationId: record.integrationId, ok: false, message: e.message })
    }
  }
  return { synced: results.length, results }
}
