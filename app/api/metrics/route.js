export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'

const startTime = Date.now()

function line(name, value, labels = {}) {
  const labelStr = Object.entries(labels)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`)
    .join(',')
  return labelStr ? `${name}{${labelStr}} ${value}` : `${name} ${value}`
}

export async function GET(request) {
  const token = process.env.METRICS_TOKEN
  if (token) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${token}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  const lines = []
  lines.push(line('asoftech_process_uptime_seconds', Math.floor((Date.now() - startTime) / 1000)))
  lines.push(line('asoftech_nodejs_heap_used_bytes', process.memoryUsage().heapUsed))
  lines.push(line('asoftech_nodejs_rss_bytes', process.memoryUsage().rss))

  try {
    const db = await getDb()
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 86_400_000).toISOString()

    const [
      orgCount,
      activeUsers,
      leadsToday,
      oppsWon,
      posTx,
      mrrAgg,
    ] = await Promise.all([
      db.collection('organizations').countDocuments({ status: { $ne: 'deleted' } }),
      db.collection('users').countDocuments({ lastLoginAt: { $gte: dayAgo } }),
      db.collection('leads').countDocuments({ createdAt: { $gte: dayAgo } }),
      db.collection('opportunities').countDocuments({ stage: 'WON', updatedAt: { $gte: dayAgo } }),
      db.collection('retail_sales').countDocuments({ createdAt: { $gte: dayAgo } }),
      db.collection('subscriptions').aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, mrr: { $sum: '$monthlyAmountInr' } } },
      ]).toArray(),
    ])

    lines.push(line('asoftech_active_tenants', orgCount))
    lines.push(line('asoftech_active_users_24h', activeUsers))
    lines.push(line('asoftech_leads_created_total', leadsToday))
    lines.push(line('asoftech_opportunities_won_total', oppsWon))
    lines.push(line('asoftech_pos_transactions_total', posTx))
    lines.push(line('asoftech_mrr_inr', mrrAgg[0]?.mrr || 0))

    const backupTs = process.env.LAST_BACKUP_TIMESTAMP
    if (backupTs) {
      lines.push(line('asoftech_last_backup_timestamp_seconds', Math.floor(Number(backupTs) / 1000)))
    }
  } catch {
    lines.push(line('asoftech_metrics_scrape_errors_total', 1))
  }

  return new NextResponse(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
  })
}
