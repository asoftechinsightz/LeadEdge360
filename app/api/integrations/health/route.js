export const dynamic = 'force-dynamic'

import { guardIntegrationRead, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { getIntegrationHealthDashboard } from '@/lib/integrations/service'

export async function GET(req) {
  try {
    const { orgId } = await guardIntegrationRead(req)
    const dashboard = await getIntegrationHealthDashboard(orgId)
    return integrationJson(dashboard)
  } catch (error) {
    return integrationError(error)
  }
}
