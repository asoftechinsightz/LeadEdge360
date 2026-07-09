export const dynamic = 'force-dynamic'

import { guardIntegrationAdmin, integrationError, integrationJson } from '@/lib/integrations/api-helpers'
import { testIntegrationConnection } from '@/lib/integrations/service'

function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(req, { params }) {
  try {
    const tenant = await guardIntegrationAdmin(req)
    const result = await testIntegrationConnection({
      orgId: tenant.orgId,
      integrationId: params.id,
      user: tenant.user,
      ip: clientIp(req),
    })
    return integrationJson({ result })
  } catch (error) {
    return integrationError(error)
  }
}
