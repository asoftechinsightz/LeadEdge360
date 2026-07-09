import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { getAgentObservabilityMetrics } from '@/lib/agents/observability'
import { listWebhookDeliveries } from '@/lib/integrations/n8n'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const url = new URL(req.url)
    const sinceHours = Number(url.searchParams.get('sinceHours') || 24)

    const [metrics, webhooks] = await Promise.all([
      getAgentObservabilityMetrics(db, orgId, { sinceHours }),
      listWebhookDeliveries(db, orgId, { limit: 20 }),
    ])

    return NextResponse.json({ success: true, metrics, webhooks })
  } catch (error) {
    return crmError(error)
  }
}
