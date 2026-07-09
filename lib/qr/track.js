import { randomUUID } from 'crypto'
import { visitorKey } from './metadata'

const EVENTS = 'qr_events'
const CONVERSIONS = 'qr_conversions'

export async function recordQrEvent(db, { orgId, qrCodeId, eventType, metadata = {} }) {
  const now = new Date().toISOString()
  await db.collection(EVENTS).insertOne({
    id: randomUUID(),
    orgId,
    qrCodeId,
    eventType,
    metadata: {
      userAgent: metadata.userAgent || metadata.ua || '',
      ip: metadata.ip || '',
      referer: metadata.referer || '',
      leadId: metadata.leadId || '',
      deviceType: metadata.deviceType || '',
      browser: metadata.browser || '',
      country: metadata.country || '',
      city: metadata.city || '',
      visitorKey: metadata.visitorKey || visitorKey(metadata),
    },
    createdAt: now,
  })
}

export async function recordQrConversion(db, {
  orgId,
  qrCodeId,
  conversionType = 'generic',
  metadata = {},
  value = null,
}) {
  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    qrCodeId,
    conversionType,
    value,
    metadata: {
      leadId: metadata.leadId || '',
      orderId: metadata.orderId || '',
      ip: metadata.ip || '',
      userAgent: metadata.userAgent || metadata.ua || '',
      deviceType: metadata.deviceType || '',
      browser: metadata.browser || '',
      country: metadata.country || '',
      city: metadata.city || '',
    },
    createdAt: now,
    updatedAt: now,
    createdBy: metadata.userId || 'system',
    updatedBy: metadata.userId || 'system',
  }
  await db.collection(CONVERSIONS).insertOne(doc)
  await recordQrEvent(db, {
    orgId,
    qrCodeId,
    eventType: 'conversion',
    metadata: { ...metadata, conversionType },
  })
  return doc
}

function aggregateBreakdown(events, field) {
  return events.reduce((acc, e) => {
    const key = e.metadata?.[field] || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

export async function getQrAnalytics(db, orgId, qrCodeId) {
  const qr = await db.collection('qr_codes').findOne(
    { orgId, id: qrCodeId },
    { projection: { _id: 0, stats: 1, code: 1, label: 1, type: 1 } },
  )
  if (!qr) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const since = new Date()
  since.setDate(since.getDate() - 30)
  const sinceIso = since.toISOString()

  const [events, conversionCount, uniqueVisitors] = await Promise.all([
    db.collection(EVENTS)
      .find({ orgId, qrCodeId, createdAt: { $gte: sinceIso } })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray(),
    db.collection(CONVERSIONS).countDocuments({ orgId, qrCodeId, createdAt: { $gte: sinceIso } }),
    db.collection(EVENTS).distinct('metadata.visitorKey', {
      orgId,
      qrCodeId,
      eventType: 'scan',
      createdAt: { $gte: sinceIso },
      'metadata.visitorKey': { $ne: '' },
    }),
  ])

  const scanEvents = events.filter((e) => e.eventType === 'scan')
  const byType = events.reduce((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] || 0) + 1
    return acc
  }, {})

  return {
    stats: qr.stats || { scans: 0, clicks: 0, conversions: 0 },
    code: qr.code,
    label: qr.label,
    type: qr.type,
    totals: {
      scans: qr.stats?.scans ?? 0,
      uniqueScans: uniqueVisitors.length,
      clicks: qr.stats?.clicks ?? 0,
      conversions: qr.stats?.conversions ?? 0,
      last30DaysConversions: conversionCount,
    },
    last30Days: byType,
    devices: aggregateBreakdown(scanEvents, 'deviceType'),
    browsers: aggregateBreakdown(scanEvents, 'browser'),
    locations: aggregateBreakdown(scanEvents, 'country'),
    recentEvents: events.slice(0, 20).map((e) => ({
      id: e.id,
      eventType: e.eventType,
      createdAt: e.createdAt,
      metadata: e.metadata,
    })),
  }
}

export async function getOrgQrSummary(db, orgId) {
  const [aggregate, topPerformers, recentConversions] = await Promise.all([
    db.collection('qr_codes').aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: null,
          totalCodes: { $sum: 1 },
          activeCodes: { $sum: { $cond: ['$active', 1, 0] } },
          scans: { $sum: '$stats.scans' },
          clicks: { $sum: '$stats.clicks' },
          conversions: { $sum: '$stats.conversions' },
        },
      },
    ]).toArray(),
    db.collection('qr_codes')
      .find({ orgId }, { projection: { _id: 0, id: 1, code: 1, label: 1, type: 1, stats: 1, active: 1 } })
      .sort({ 'stats.scans': -1 })
      .limit(5)
      .toArray(),
    db.collection(CONVERSIONS)
      .find({ orgId }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
  ])

  const totals = aggregate[0] || {
    totalCodes: 0,
    activeCodes: 0,
    scans: 0,
    clicks: 0,
    conversions: 0,
  }

  return {
    totals,
    topPerformers,
    recentConversions,
  }
}
