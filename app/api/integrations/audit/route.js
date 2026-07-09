export const dynamic = 'force-dynamic'

import { guardIntegrationRead, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { getIntegrationAuditTrail } from '@/lib/integrations/service'

export async function GET(req) {
  try {
    const { orgId } = await guardIntegrationRead(req)
    const url = new URL(req.url)
    const integrationId = url.searchParams.get('integrationId') || undefined
    const limit = Number(url.searchParams.get('limit') || 50)
    const logs = await getIntegrationAuditTrail(orgId, { integrationId, limit })
    return integrationJson({ logs })
  } catch (error) {
    return integrationError(error)
  }
}
