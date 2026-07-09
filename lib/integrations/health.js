import { getDb } from '@/lib/mongo'
import { listIntegrationsForOrg } from './service.js'

export async function runHealthChecksForOrg(orgId) {
  const { testIntegrationConnection } = await import('./service.js')
  const items = await listIntegrationsForOrg(orgId)
  const results = []
  for (const item of items) {
    if (item.status !== 'connected' || !item.implemented) continue
    try {
      const r = await testIntegrationConnection({ orgId, integrationId: item.id })
      results.push({ integrationId: item.id, ok: r.ok, message: r.message })
    } catch (e) {
      results.push({ integrationId: item.id, ok: false, message: e.message })
    }
  }
  return results
}

export async function runHealthChecksAllTenants() {
  const db = await getDb()
  const orgIds = await db.collection('org_integrations')
    .distinct('orgId', { status: 'connected' })
  const all = []
  for (const orgId of orgIds) {
    const r = await runHealthChecksForOrg(orgId)
    all.push({ orgId, results: r })
  }
  return all
}
