import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import { replayPlatformEvents, listReplayJobs } from '@/lib/events/replay'
import { PROJECTION_TARGETS } from '@/lib/events/processors'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const jobs = await listReplayJobs(db, orgId)
    return NextResponse.json({ success: true, jobs })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const tenant = await guardPlatformRequest(req)
    const body = await req.json().catch(() => ({}))
    const db = await getDb()

    const result = await replayPlatformEvents(db, {
      orgId: body.scope === 'all' ? null : tenant.orgId,
      from: body.from || null,
      to: body.to || null,
      type: body.type || null,
      targets: body.targets || Object.values(PROJECTION_TARGETS),
      dryRun: !!body.dryRun,
      clearTargets: !!body.clearTargets,
      userId: tenant.user?.id || tenant.user?.email,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return crmError(error)
  }
}
