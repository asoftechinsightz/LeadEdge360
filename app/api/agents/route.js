import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { listAgents } from '@/lib/agents/registry'
import { getAgentRuntimeStatus } from '@/lib/agents/service'
import { getAgentObservabilityMetrics } from '@/lib/agents/observability'
import { listSkills } from '@/lib/agents/skills'
import { listTools } from '@/lib/agents/tools/registry'
import { enrichAgentWithSecurity } from '@/lib/agents/security'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const [agents, runtime, observability] = await Promise.all([
      Promise.resolve(listAgents().map(enrichAgentWithSecurity)),
      getAgentRuntimeStatus(db, orgId),
      getAgentObservabilityMetrics(db, orgId),
    ])
    return NextResponse.json({
      success: true,
      agents,
      runtime,
      observability,
      skills: listSkills(),
      tools: listTools(),
    })
  } catch (error) {
    return crmError(error)
  }
}
