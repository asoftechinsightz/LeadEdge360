export const dynamic = 'force-dynamic'

import { guardIntegrationRead, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { getIntegrationDef } from '@/lib/integrations/registry'
import { getOrgIntegrationCredentials } from '@/lib/integrations/service'
import { getDb } from '@/lib/mongo'
import { getOrgIntegration } from '@/lib/integrations/store'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardIntegrationRead(req)
    const integrationId = params.id
    const def = getIntegrationDef(integrationId)
    if (!def) return integrationError(Object.assign(new Error('NOT_FOUND'), { detail: 'Unknown integration' }))

    const db = await getDb()
    const record = await getOrgIntegration(db, orgId, integrationId)
    const creds = await getOrgIntegrationCredentials(orgId, integrationId)

    return integrationJson({
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
  } catch (error) {
    return integrationError(error)
  }
}
