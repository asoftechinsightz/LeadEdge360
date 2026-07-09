import { randomUUID } from 'crypto'
import { COLLECTIONS, DAILY_AUTOMATION_IST } from './constants.js'
import { runResearchAgent } from './research-agent.js'
import { runContentWriterAgent } from './content-writer.js'
import { runReelCreatorAgent } from './reel-creator.js'
import { runCeoMarketingAgent } from './ceo-marketing-agent.js'
import { runEngagementAgent } from './engagement-agent.js'
import { createGraphicBriefs } from './graphic-brief.js'
import { publishDueContent } from './publisher.js'
import { getMarketingDashboard } from './analytics.js'
import { getMarketingConfig } from './config.js'

function istNow(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + 330 * 60000)
}

function todayId(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

async function alreadyRan(db, orgId, agentId, day) {
  const hit = await db.collection(COLLECTIONS.AGENT_RUNS).findOne({ orgId, agentId, day })
  return Boolean(hit)
}

async function markRan(db, orgId, agentId, day, result = {}) {
  const slim = { ...result }
  delete slim.research
  delete slim.report
  delete slim.brief
  await db.collection(COLLECTIONS.AGENT_RUNS).updateOne(
    { orgId, agentId, day },
    {
      $set: { result: slim, completedAt: new Date().toISOString() },
      $setOnInsert: { id: randomUUID(), createdAt: new Date().toISOString() },
    },
    { upsert: true },
  )
}

function slimStepResult(agentId, result = {}) {
  const step = { agentId, ...result }
  if (step.research) {
    step.research = { day: step.research.day, summary: step.research.summary }
  }
  if (step.report) {
    step.report = { reportId: step.reportId || step.report.id, title: step.report.title }
  }
  if (step.brief) {
    step.briefId = step.brief.id || step.briefId
    delete step.brief
  }
  return step
}

/**
 * Daily orchestrator — runs AI Marketing Department jobs by IST schedule
 */
export async function runDailyOrchestrator(db, orgId, { date = new Date(), force = false } = {}) {
  const config = await getMarketingConfig(db, orgId)
  if (!config.enabled) return { skipped: true, reason: 'marketing_engine_disabled' }

  const ist = istNow(date)
  const hour = ist.getHours()
  const day = todayId(date)
  const steps = []

  const dueSlots = DAILY_AUTOMATION_IST.filter((s) => s.hour === hour)
  if (!dueSlots.length && !force) {
    return { skipped: true, reason: 'no_jobs_due', istHour: hour, day }
  }

  const slots = force ? DAILY_AUTOMATION_IST : dueSlots

  for (const slot of slots) {
    if (!force && slot.hour !== hour) continue
    const agentId = slot.agentId
    if (!force && await alreadyRan(db, orgId, agentId, day)) {
      steps.push({ job: slot.job, agentId, skipped: true, reason: 'already_ran' })
      continue
    }

    let result
    switch (slot.job) {
      case 'research':
        result = await runResearchAgent(db, orgId, { date })
        break
      case 'content':
        result = await runContentWriterAgent(db, orgId, { date })
        break
      case 'graphics': {
        const content = await db.collection(COLLECTIONS.CONTENT)
          .find({ orgId, 'metadata.dailyBatch': day }, { projection: { _id: 0 } })
          .toArray()
        result = await createGraphicBriefs(db, orgId, content)
        break
      }
      case 'reel':
        result = await runReelCreatorAgent(db, orgId, { date })
        break
      case 'publish_linkedin':
      case 'publish_facebook':
      case 'publish_instagram':
      case 'publish_twitter':
      case 'publish_reel':
        result = await publishDueContent(db, orgId, { now: date })
        break
      case 'analytics': {
        const dashboard = await getMarketingDashboard(db, orgId)
        await db.collection(COLLECTIONS.ANALYTICS).updateOne(
          { orgId, day },
          { $set: { dashboard, capturedAt: new Date().toISOString() } },
          { upsert: true },
        )
        result = { captured: true, day }
        break
      }
      case 'daily_report':
        result = await runCeoMarketingAgent(db, orgId, { date })
        break
      default:
        result = { skipped: true, reason: 'unknown_job' }
    }

    if (!force || !result?.skipped) {
      await markRan(db, orgId, agentId, day, result)
    }
    steps.push({ job: slot.job, agentId, label: slot.label, ...result })
  }

  return { day, istHour: hour, steps }
}

/** Run all daily jobs in sequence (manual "Run Today" button) */
export async function runFullDailyPipeline(db, orgId, { date = new Date(), skipLlm = true } = {}) {
  const day = todayId(date)
  const steps = []
  const errors = []

  const pipeline = [
    { agentId: 'research-agent', fn: () => runResearchAgent(db, orgId, { date, skipLlm }) },
    { agentId: 'content-writer-agent', fn: () => runContentWriterAgent(db, orgId, { date, skipLlm }) },
    { agentId: 'graphic-designer-ai', fn: async () => {
      const content = await db.collection(COLLECTIONS.CONTENT)
        .find({ orgId, 'metadata.dailyBatch': day }, { projection: { _id: 0 } }).toArray()
      return createGraphicBriefs(db, orgId, content, { skipLlm })
    }},
    { agentId: 'reel-creator-agent', fn: () => runReelCreatorAgent(db, orgId, { date, skipLlm }) },
    { agentId: 'engagement-agent', fn: () => runEngagementAgent(db, orgId, { skipLlm }) },
    { agentId: 'analytics-agent', fn: async () => {
      const dashboard = await getMarketingDashboard(db, orgId)
      await db.collection(COLLECTIONS.ANALYTICS).updateOne(
        { orgId, day },
        { $set: { dashboard, capturedAt: new Date().toISOString() } },
        { upsert: true },
      )
      return { captured: true }
    }},
    { agentId: 'ceo-marketing-agent', fn: () => runCeoMarketingAgent(db, orgId, { date, skipLlm }) },
  ]

  for (const step of pipeline) {
    try {
      const result = await step.fn()
      await markRan(db, orgId, step.agentId, day, result)
      steps.push(slimStepResult(step.agentId, result))
    } catch (err) {
      const message = err?.message || String(err)
      errors.push({ agentId: step.agentId, error: message })
      steps.push({ agentId: step.agentId, failed: true, error: message })
    }
  }

  return { day, skipLlm, steps, errors, ok: errors.length === 0 }
}
