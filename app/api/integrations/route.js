export const dynamic = 'force-dynamic'

import { guardIntegrationRead, guardIntegrationAdmin, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { listIntegrationsForOrg } from '@/lib/integrations/service'

export async function GET(req) {
  try {
    const { orgId } = await guardIntegrationRead(req)
    const integrations = await listIntegrationsForOrg(orgId)
    return integrationJson({ integrations })
  } catch (error) {
    return integrationError(error)
  }
}
