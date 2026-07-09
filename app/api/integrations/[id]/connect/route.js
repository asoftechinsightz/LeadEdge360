export const dynamic = 'force-dynamic'

import { guardIntegrationAdmin, integrationError, integrationJson, buildTenantWebhookUrl } from '@/lib/integrations/api-helpers'
import { connectIntegration } from '@/lib/integrations/service'
import { getIntegrationDef } from '@/lib/integrations/registry'

function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(req, { params }) {
  try {
    const tenant = await guardIntegrationAdmin(req)
    const integrationId = params.id
    const def = getIntegrationDef(integrationId)
    if (!def) return integrationError(Object.assign(new Error('NOT_FOUND'), { detail: 'Unknown integration' }))

    const body = await req.json().catch(() => ({}))
    const result = await connectIntegration({
      orgId: tenant.orgId,
      integrationId,
      credentials: body.credentials || body,
      mode: body.mode || 'api_key',
      user: tenant.user,
      ip: clientIp(req),
    })

    return integrationJson({
      ...result,
      webhookUrl: buildTenantWebhookUrl(integrationId, tenant.orgId),
    })
  } catch (error) {
    return integrationError(error)
  }
}
