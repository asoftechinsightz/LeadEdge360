export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/mongo'
import { guardIntegrationAdmin, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { getOrgSsoConfig, saveOrgSsoConfig } from '@/lib/auth/sso'

export async function GET(req) {
  try {
    const { orgId } = await guardIntegrationAdmin(req)
    const db = await getDb()
    const config = await getOrgSsoConfig(db, orgId)
    return integrationJson({ config })
  } catch (error) {
    return integrationError(error)
  }
}

export async function PUT(req) {
  try {
    const { orgId, user } = await guardIntegrationAdmin(req)
    const body = await req.json()
    const db = await getDb()
    const config = await saveOrgSsoConfig(db, orgId, body, user.id)
    return integrationJson({ config })
  } catch (error) {
    return integrationError(error)
  }
}
