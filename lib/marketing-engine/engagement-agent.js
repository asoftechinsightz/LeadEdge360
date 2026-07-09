import { randomUUID } from 'crypto'
import { COLLECTIONS } from './constants.js'
import { generateMarketingCopy } from './llm.js'

/**
 * Engagement Agent — monitors social interactions (n8n feeds queue)
 * Generates reply suggestions; escalates sales intent to CRM.
 */
export async function runEngagementAgent(db, orgId, { limit = 20, skipLlm = false } = {}) {
  const pending = await db.collection(COLLECTIONS.ENGAGEMENT)
    .find({ orgId, status: 'pending' }, { projection: { _id: 0 } })
    .limit(limit)
    .toArray()

  const results = { processed: 0, suggestions: 0, escalated: 0 }

  for (const item of pending) {
    const isSalesIntent = /demo|pricing|quote|interested|call|meeting|buy/i.test(item.text || '')
    const fallback = isSalesIntent
      ? `Thanks for reaching out! I'd love to show you LeadEdge360. Book a free demo: asoftechinsightz.com/contact`
      : `Thanks for your comment! We help Indian SMEs grow with AI-powered CRM. Happy to answer any questions.`

    const { text, engine } = await generateMarketingCopy({
      system: 'Engagement Agent for AsoftechInsightz. Professional, helpful replies. Escalate sales intent to demo CTA. Never be pushy.',
      user: `Platform: ${item.platform}. Comment: ${item.text}. Author: ${item.authorName || 'user'}`,
      fallback,
      temperature: 0.5,
      skipLlm,
    })

    await db.collection(COLLECTIONS.ENGAGEMENT).updateOne(
      { orgId, id: item.id },
      {
        $set: {
          status: isSalesIntent ? 'escalated' : 'suggested',
          suggestedReply: text,
          engine,
          processedAt: new Date().toISOString(),
        },
      },
    )

    results.processed++
    results.suggestions++
    if (isSalesIntent) results.escalated++
  }

  return results
}

/** Ingest engagement item from n8n webhook */
export async function ingestEngagementItem(db, orgId, raw = {}) {
  const doc = {
    id: randomUUID(),
    orgId,
    platform: raw.platform || 'linkedin',
    type: raw.type || 'comment',
    text: raw.text || '',
    authorName: raw.authorName || '',
    postId: raw.postId || null,
    url: raw.url || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  await db.collection(COLLECTIONS.ENGAGEMENT).insertOne(doc)
  return doc
}
