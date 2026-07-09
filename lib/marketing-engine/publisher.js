import { randomUUID, createHash } from 'crypto'
import { COLLECTIONS, HASHTAG_POOLS, PLATFORMS } from './constants.js'
import { emitPlatformEvent } from '@/lib/events/bus'
import { publishWebhookEvent } from '@/lib/integrations/n8n.js'
import { PLATFORM_EVENTS } from '@/lib/events/types'

function rotateHashtags(product, index) {
  const pool = [
    ...(HASHTAG_POOLS[product] || HASHTAG_POOLS.leadedge360),
    ...HASHTAG_POOLS.general,
  ]
  const count = 5
  const tags = []
  for (let i = 0; i < count; i++) {
    tags.push(pool[(index + i) % pool.length])
  }
  return [...new Set(tags)]
}

function publishBodyHash(body, hashtags) {
  return createHash('sha256')
    .update(`${body}::${hashtags.join(',')}`)
    .digest('hex')
}

/**
 * Agent 4 — Social Publisher
 * Queues due posts, deduplicates, rotates hashtags, dispatches to n8n.
 */
export async function publishDueContent(db, orgId, { now = new Date(), limit = 20 } = {}) {
  const isoNow = now.toISOString()
  const results = { published: 0, skipped: 0, failed: 0, items: [] }

  const due = await db.collection(COLLECTIONS.CALENDAR)
    .find({
      orgId,
      status: 'scheduled',
      scheduledAt: { $lte: isoNow },
    }, { projection: { _id: 0 } })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .toArray()

  for (const [index, entry] of due.entries()) {
    const content = await db.collection(COLLECTIONS.CONTENT).findOne(
      { orgId, id: entry.contentId },
      { projection: { _id: 0 } },
    )
    if (!content) {
      results.skipped++
      continue
    }

    if (!PLATFORMS.includes(entry.platform) && entry.platform !== 'blog') {
      results.skipped++
      continue
    }

    const hashtags = rotateHashtags(content.product || 'leadedge360', index)
    const hash = publishBodyHash(content.body, hashtags)

    const prior = await db.collection(COLLECTIONS.PUBLISH_LOG).findOne({ orgId, bodyHash: hash })
    if (prior) {
      results.skipped++
      await db.collection(COLLECTIONS.CALENDAR).updateOne(
        { orgId, id: entry.id },
        { $set: { status: 'skipped_duplicate', updatedAt: isoNow } },
      )
      continue
    }

    const queueId = randomUUID()
    const payload = {
      queueId,
      orgId,
      platform: entry.platform,
      contentId: content.id,
      title: content.title,
      body: content.body,
      hashtags,
      cta: content.cta,
      scheduledAt: entry.scheduledAt,
      slot: entry.slot,
      product: content.product,
    }

    try {
      const event = await emitPlatformEvent({
        db,
        orgId,
        type: PLATFORM_EVENTS.MARKETING_CONTENT_PUBLISH,
        entity: 'marketing_content',
        entityId: content.id,
        payload,
        source: 'marketing-publisher',
      })

      await publishWebhookEvent(event, db)

      await db.collection(COLLECTIONS.PUBLISH_QUEUE).insertOne({
        id: queueId,
        orgId,
        ...payload,
        status: 'dispatched',
        eventId: event?.id,
        createdAt: isoNow,
      })

      await db.collection(COLLECTIONS.PUBLISH_LOG).insertOne({
        id: randomUUID(),
        orgId,
        contentId: content.id,
        platform: entry.platform,
        bodyHash: hash,
        publishedAt: isoNow,
      })

      await db.collection(COLLECTIONS.CONTENT).updateOne(
        { orgId, id: content.id },
        { $set: { status: 'published', publishedAt: isoNow, updatedAt: isoNow } },
      )

      await db.collection(COLLECTIONS.CALENDAR).updateOne(
        { orgId, id: entry.id },
        { $set: { status: 'published', publishQueueId: queueId, updatedAt: isoNow } },
      )

      results.published++
      results.items.push({ contentId: content.id, platform: entry.platform, queueId })
    } catch (err) {
      results.failed++
      await db.collection(COLLECTIONS.CALENDAR).updateOne(
        { orgId, id: entry.id },
        { $set: { status: 'failed', error: err.message, updatedAt: isoNow } },
      )
    }
  }

  return results
}
