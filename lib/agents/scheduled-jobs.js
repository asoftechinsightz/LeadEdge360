import { randomUUID } from 'crypto'
import { emitPlatformEvent } from '@/lib/events/bus'
import { emitCustomerEvent } from '@/lib/events/emit-helpers'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { dispatchAgentTasks } from '@/lib/agents/dispatch'

const RENEWAL_DAYS_AHEAD = 30

/**
 * Scan tenant data and emit scheduled platform events (renewals, meetings).
 * Intended for cron: POST /api/agents/scheduled/run
 */
export async function runScheduledAgentJobs(db, orgId, { renewalDaysAhead = RENEWAL_DAYS_AHEAD } = {}) {
  const results = { renewals: [], meetings: [], errors: [] }
  const now = new Date()
  const renewalCutoff = new Date(now.getTime() + renewalDaysAhead * 24 * 3600_000)

  const invoices = await db.collection('invoices')
    .find({
      orgId,
      status: { $in: ['PAID', 'UNPAID', 'PARTIAL'] },
    }, { projection: { _id: 0, invoiceNumber: 1, clientName: 1, leadId: 1, createdAt: 1, totalAmount: 1 } })
    .limit(200)
    .toArray()

  for (const inv of invoices) {
    const created = new Date(inv.createdAt || now)
    const renewalDate = new Date(created)
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)

    if (renewalDate > now && renewalDate <= renewalCutoff) {
      const customerId = inv.leadId || inv.clientName || inv.invoiceNumber
      const dedupeKey = `renewal:${customerId}:${renewalDate.toISOString().slice(0, 10)}`
      const existing = await db.collection('scheduled_event_log').findOne({ orgId, dedupeKey })
      if (existing) continue

      try {
        const event = await emitCustomerEvent(db, {
          orgId,
          type: PLATFORM_EVENTS.CUSTOMER_RENEWAL_DUE,
          customerId,
          payload: {
            customerId,
            clientName: inv.clientName,
            renewalDate: renewalDate.toISOString(),
            invoiceNumber: inv.invoiceNumber,
            daysUntilRenewal: Math.ceil((renewalDate - now) / (24 * 3600_000)),
          },
        })

        await db.collection('scheduled_event_log').insertOne({
          id: randomUUID(),
          orgId,
          dedupeKey,
          eventType: PLATFORM_EVENTS.CUSTOMER_RENEWAL_DUE,
          eventId: event?.id,
          createdAt: new Date().toISOString(),
        })

        results.renewals.push({ customerId, renewalDate: renewalDate.toISOString() })
      } catch (err) {
        results.errors.push({ type: 'renewal', error: err.message })
      }
    }
  }

  const tomorrow = new Date(now.getTime() + 24 * 3600_000).toISOString()
  const followups = await db.collection('follow_ups')
    .find({
      orgId,
      status: 'pending',
      dueAt: { $gte: now.toISOString(), $lte: tomorrow },
    }, { projection: { _id: 0 } })
    .limit(100)
    .toArray()

  for (const fu of followups) {
    const isMeeting = /meeting|call|demo|visit/i.test(fu.title || '')
    if (!isMeeting) continue

    const dedupeKey = `meeting:${fu.id}`
    const existing = await db.collection('scheduled_event_log').findOne({ orgId, dedupeKey })
    if (existing) continue

    try {
      const event = await emitPlatformEvent({
        db,
        orgId,
        type: PLATFORM_EVENTS.MEETING_SCHEDULED,
        entity: 'lead',
        entityId: fu.leadId,
        payload: {
          leadId: fu.leadId,
          title: fu.title,
          scheduledAt: fu.dueAt,
          followupId: fu.id,
        },
        source: 'scheduled-jobs',
      })

      await db.collection('scheduled_event_log').insertOne({
        id: randomUUID(),
        orgId,
        dedupeKey,
        eventType: PLATFORM_EVENTS.MEETING_SCHEDULED,
        eventId: event?.id,
        createdAt: new Date().toISOString(),
      })

      results.meetings.push({ followupId: fu.id, leadId: fu.leadId, dueAt: fu.dueAt })
    } catch (err) {
      results.errors.push({ type: 'meeting', error: err.message })
    }
  }

  return results
}

/** Marketing Engine cron — publisher each run; planner Sundays; follow-up 02:00 UTC. */
export async function runMarketingScheduledJobs(db, orgId) {
  const results = { marketing: [] }
  try {
    const { runMarketingEngineWorker } = await import('@/lib/marketing-engine/worker')
    const { weekIdForDate } = await import('@/lib/marketing-engine/content-planner')

    const now = new Date()
    const pub = await runMarketingEngineWorker(db, orgId, { job: 'publisher' })
    results.marketing.push({ type: 'publisher', ...pub })

    const daily = await runMarketingEngineWorker(db, orgId, { job: 'daily_tick' })
    results.marketing.push({ type: 'daily_orchestrator', ...daily })

    if (now.getUTCDay() === 0) {
      const plan = await runMarketingEngineWorker(db, orgId, { job: 'planner' })
      results.marketing.push({ type: 'planner', weekId: weekIdForDate(now), ...plan })
    }

    if (now.getUTCHours() === 2) {
      const fu = await runMarketingEngineWorker(db, orgId, { job: 'followup' })
      results.marketing.push({ type: 'followup', ...fu })
    }
  } catch (err) {
    results.marketing.push({ type: 'error', error: err.message })
  }
  return results
}

/** Drip / workflow step processor — enrollments due for email or WhatsApp. */
export async function runAutomationScheduledJobs(db, orgId) {
  try {
    const { processScheduledCampaigns } = await import('@/lib/campaigns/campaigns')
    return await processScheduledCampaigns(orgId)
  } catch (err) {
    return { error: err.message }
  }
}

/** Nightly predictive scoring model retrain (03:00 UTC). */
export async function runScoringModelTraining(db, orgId) {
  try {
    const { trainScoringModel } = await import('@/lib/ai/train-model')
    return await trainScoringModel(db, orgId)
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

export async function runScoringTrainingForAllOrgs(db) {
  const now = new Date()
  if (now.getUTCHours() !== 3) {
    return { skipped: true, reason: 'training_scheduled_03_utc' }
  }

  const { retrainAllOrgModels } = await import('@/lib/ai/train-model')
  const reports = await retrainAllOrgModels(db)
  const trained = reports.filter((r) => r.ok)
  const improved = reports.filter((r) => r.model?.metrics?.targetImprovementMet)
  return {
    orgCount: reports.length,
    trained: trained.length,
    improved: improved.length,
    reports,
  }
}

export async function runScheduledJobsForAllOrgs(db) {
  const orgIds = await db.collection('org_ai_settings')
    .find({ enabled: { $ne: false } }, { projection: { orgId: 1 } })
    .toArray()

  if (!orgIds.length) {
    const leads = await db.collection('leads').distinct('orgId')
    for (const orgId of leads.slice(0, 50)) {
      orgIds.push({ orgId })
    }
  }

  const reports = []
  for (const { orgId } of orgIds) {
    if (!orgId) continue
    const result = await runScheduledAgentJobs(db, orgId)
    const marketing = await runMarketingScheduledJobs(db, orgId)
    const automation = await runAutomationScheduledJobs(db, orgId)
    reports.push({ orgId, ...result, ...marketing, automation })
  }
  return reports
}
