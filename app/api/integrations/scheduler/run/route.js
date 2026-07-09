export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { runScheduledSyncs } from '@/lib/integrations/sync-scheduler'
import { runHealthChecksAllTenants } from '@/lib/integrations/health'

const CRON_SECRET = process.env.INTEGRATION_CRON_SECRET || process.env.CRON_SECRET || ''

function authorize(req) {
  if (!CRON_SECRET) return process.env.NODE_ENV !== 'production'
  const auth = req.headers.get('authorization') || ''
  return auth === `Bearer ${CRON_SECRET}` || req.headers.get('x-cron-secret') === CRON_SECRET
}

export async function POST(req) {
  if (!authorize(req)) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
  }
  const url = new URL(req.url)
  const task = url.searchParams.get('task') || 'sync'
  const orgId = url.searchParams.get('orgId') || null

  if (task === 'health') {
    const results = await runHealthChecksAllTenants()
    return NextResponse.json({ success: true, task: 'health', results })
  }

  const result = await runScheduledSyncs({ orgId, force: url.searchParams.get('force') === '1' })
  return NextResponse.json({ success: true, task: 'sync', ...result })
}
