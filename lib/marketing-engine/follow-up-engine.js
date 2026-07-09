import { randomUUID } from 'crypto'
import { FOLLOW_UP_CADENCE_DAYS } from './constants.js'
import { suggestLeadReply } from '@/lib/ai/service'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'

const CADENCE_LABELS = ['followup_1', 'followup_2', 'followup_3', 'ceo_message', 'last_attempt']

/**
 * Phase 5 — Follow-up engine
 * Schedules and sends cadence messages when lead has no response.
 */
export async function processFollowUpCadence(db, orgId, { now = new Date() } = {}) {
  const results = { processed: 0, sent: 0, stopped: 0, skipped: 0 }

  const leads = await db.collection('leads')
    .find({
      orgId,
      status: { $nin: ['Won', 'Lost'] },
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }, { projection: { _id: 0 } })
    .limit(200)
    .toArray()

  for (const lead of leads) {
    results.processed++
    const cadence = await db.collection('marketing_followup_state').findOne({ orgId, leadId: lead.id })
    if (cadence?.stoppedAt) {
      results.stopped++
      continue
    }

    if (lead.lastReplyAt) {
      if (!cadence?.stoppedAt) {
        await db.collection('marketing_followup_state').updateOne(
          { orgId, leadId: lead.id },
          { $set: { stoppedAt: now.toISOString(), reason: 'customer_replied', updatedAt: now.toISOString() } },
          { upsert: true },
        )
      }
      results.stopped++
      continue
    }

    const step = cadence?.step || 0
    if (step >= FOLLOW_UP_CADENCE_DAYS.length) {
      results.skipped++
      continue
    }

    const daysSinceCreate = Math.floor((now - new Date(lead.createdAt)) / 86400000)
    const dueDay = FOLLOW_UP_CADENCE_DAYS[step]
    if (daysSinceCreate < dueDay) {
      results.skipped++
      continue
    }

    const intent = step === 3 ? 'ceo' : step === 4 ? 'last' : 'followup'
    const { suggestion, engine } = await suggestLeadReply(lead, { intent: intent === 'ceo' ? 'nurture' : 'followup' })

    const followupId = randomUUID()
    await db.collection('follow_ups').insertOne({
      id: followupId,
      orgId,
      leadId: lead.id,
      title: `Marketing cadence — ${CADENCE_LABELS[step] || `step_${step}`}`,
      notes: suggestion,
      channel: lead.email ? 'email' : 'whatsapp',
      status: 'pending',
      dueAt: now.toISOString(),
      createdAt: now.toISOString(),
      metadata: { cadenceStep: step, engine, source: 'marketing-followup-engine' },
    })

    await emitPlatformEvent({
      db,
      orgId,
      type: PLATFORM_EVENTS.MARKETING_FOLLOWUP_SCHEDULED,
      entity: 'lead',
      entityId: lead.id,
      payload: { followupId, step, cadenceLabel: CADENCE_LABELS[step], channel: lead.email ? 'email' : 'whatsapp' },
      source: 'marketing-followup-engine',
    })

    await db.collection('marketing_followup_state').updateOne(
      { orgId, leadId: lead.id },
      {
        $set: { step: step + 1, lastSentAt: now.toISOString(), updatedAt: now.toISOString() },
        $setOnInsert: { id: randomUUID(), createdAt: now.toISOString() },
      },
      { upsert: true },
    )

    results.sent++
  }

  return results
}
