export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/mongo'
import { guardIntegrationAdmin, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { getOrgSsoConfig, saveOrgSsoConfig } from '@/lib/auth/sso'
import { getOrgIntegration, upsertOrgIntegration } from '@/lib/integrations/store'

const EMAIL_INTEGRATIONS = ['gmail', 'microsoft365']

export async function GET(req) {
  try {
    const { orgId } = await guardIntegrationAdmin(req)
    const db = await getDb()
    const sso = await getOrgSsoConfig(db, orgId)

    const emailSync = {}
    for (const id of EMAIL_INTEGRATIONS) {
      const record = await getOrgIntegration(db, orgId, id)
      emailSync[id] = {
        connected: record?.status === 'connected',
        emailSyncEnabled: record?.metadata?.emailSyncEnabled !== false,
        lastSyncAt: record?.lastSyncAt || null,
      }
    }

    return integrationJson({ sso, emailSync })
  } catch (error) {
    return integrationError(error)
  }
}

export async function PUT(req) {
  try {
    const { orgId, user } = await guardIntegrationAdmin(req)
    const body = await req.json()
    const db = await getDb()

    let sso = null
    if (body.sso) {
      sso = await saveOrgSsoConfig(db, orgId, body.sso, user.id)
    }

    if (body.emailSync) {
      for (const [integrationId, patch] of Object.entries(body.emailSync)) {
        if (!EMAIL_INTEGRATIONS.includes(integrationId)) continue
        const record = await getOrgIntegration(db, orgId, integrationId)
        if (!record) continue
        await upsertOrgIntegration(db, orgId, integrationId, {
          metadata: {
            ...(record.metadata || {}),
            ...(patch.emailSyncEnabled !== undefined
              ? { emailSyncEnabled: Boolean(patch.emailSyncEnabled) }
              : {}),
          },
        })
      }
    }

    const emailSync = {}
    for (const id of EMAIL_INTEGRATIONS) {
      const record = await getOrgIntegration(db, orgId, id)
      emailSync[id] = {
        connected: record?.status === 'connected',
        emailSyncEnabled: record?.metadata?.emailSyncEnabled !== false,
        lastSyncAt: record?.lastSyncAt || null,
      }
    }

    return integrationJson({
      sso: sso || await getOrgSsoConfig(db, orgId),
      emailSync,
    })
  } catch (error) {
    return integrationError(error)
  }
}
