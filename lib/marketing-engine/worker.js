import { runMarketingPlanner } from './content-planner.js'
import { createGraphicBriefs } from './graphic-brief.js'
import { createVideoBriefs } from './video-brief.js'
import { publishDueContent } from './publisher.js'
import { processFollowUpCadence } from './follow-up-engine.js'
import { runDailyOrchestrator, runFullDailyPipeline } from './daily-orchestrator.js'
import { getMarketingConfig } from './config.js'
import { COLLECTIONS } from './constants.js'

/**
 * Orchestrates marketing engine jobs (cron / manual trigger).
 */
export async function runMarketingEngineWorker(db, orgId, { job = 'all' } = {}) {
  const config = await getMarketingConfig(db, orgId)
  if (!config.enabled) {
    return { skipped: true, reason: 'marketing_engine_disabled' }
  }

  const report = { orgId, job, steps: [] }

  if (job === 'daily' || job === 'daily_tick') {
    const daily = await runDailyOrchestrator(db, orgId)
    report.steps.push({ step: 'daily_orchestrator', ...daily })
    return report
  }

  if (job === 'daily_full') {
    const daily = await runFullDailyPipeline(db, orgId)
    report.steps.push({ step: 'daily_full_pipeline', ...daily })
    return report
  }

  if (job === 'all' || job === 'planner') {
    const plan = await runMarketingPlanner(db, orgId)
    report.steps.push({ step: 'planner', ...plan })

    const content = await db.collection(COLLECTIONS.CONTENT)
      .find({ orgId, weekId: plan.weekId }, { projection: { _id: 0 } })
      .toArray()

    const graphics = await createGraphicBriefs(db, orgId, content)
    report.steps.push({ step: 'graphic_briefs', ...graphics })

    const videos = await createVideoBriefs(db, orgId, content)
    report.steps.push({ step: 'video_briefs', ...videos })
  }

  if (job === 'all' || job === 'publisher') {
    const pub = await publishDueContent(db, orgId)
    report.steps.push({ step: 'publisher', ...pub })
  }

  if (job === 'all' || job === 'followup') {
    const fu = await processFollowUpCadence(db, orgId)
    report.steps.push({ step: 'followup', ...fu })
  }

  return report
}

export async function runMarketingEngineForAllOrgs(db) {
  const orgs = await db.collection('marketing_engine_config')
    .find({ enabled: { $ne: false } }, { projection: { orgId: 1 } })
    .toArray()

  if (!orgs.length) {
    const leadOrgs = await db.collection('leads').distinct('orgId')
    for (const orgId of leadOrgs.slice(0, 20)) {
      if (orgId) orgs.push({ orgId })
    }
  }

  const reports = []
  for (const { orgId } of orgs) {
    if (!orgId) continue
    reports.push(await runMarketingEngineWorker(db, orgId, { job: 'publisher' }))
  }
  return reports
}
