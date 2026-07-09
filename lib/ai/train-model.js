import { randomUUID } from 'crypto'
import {
  computeLeadEngagement,
  evaluateModelAccuracy,
  evaluateRuleBaseline,
  isLostStatus,
  isWonStatus,
  probabilityToLogOdds,
  scoreWithModel,
} from './predictive-scoring.js'

const DEFAULT_WINDOW_DAYS = 90
const MIN_WINS_TO_TRAIN = 5

/**
 * @param {Date} since
 */
function leadDateFilter(since) {
  return {
    $or: [
      { updatedAt: { $gte: since.toISOString() } },
      { createdAt: { $gte: since } },
      { createdAt: { $gte: since.toISOString() } },
    ],
  }
}

/**
 * Build weighted feature stats from won/lost leads.
 * @param {object[]} wins
 * @param {object[]} losses
 */
function buildFeatureWeights(wins, losses) {
  const total = wins.length + losses.length
  const baselineWinRate = total > 0 ? wins.length / total : 0.15
  const baselineLogOdds = probabilityToLogOdds(baselineWinRate)

  function categoryStats(values, keyFn) {
    const stats = {}
    const all = [...wins, ...losses]
    for (const lead of all) {
      const key = keyFn(lead) || 'unknown'
      if (!stats[key]) stats[key] = { wins: 0, total: 0 }
      stats[key].total++
      if (isWonStatus(lead.status)) stats[key].wins++
    }

    const weights = {}
    for (const [key, row] of Object.entries(stats)) {
      if (row.total < 2) continue
      const winRate = row.wins / row.total
      const logOddsDelta = probabilityToLogOdds(winRate) - baselineLogOdds
      weights[key] = {
        winRate,
        sampleSize: row.total,
        logOddsDelta,
      }
    }
    return weights
  }

  const sourceWeights = categoryStats([...wins, ...losses], (l) => String(l.source || 'unknown').toLowerCase())
  const industryWeights = categoryStats([...wins, ...losses], (l) => String(l.industry || l.demoIndustry || '').trim() || 'unknown')

  const wonEngagement = wins.map((l) => l._engagement?.touchpoints || 0)
  const lostEngagement = losses.map((l) => l._engagement?.touchpoints || 0)
  const avgWon = wonEngagement.length
    ? wonEngagement.reduce((a, b) => a + b, 0) / wonEngagement.length
    : 0
  const avgLost = lostEngagement.length
    ? lostEngagement.reduce((a, b) => a + b, 0) / lostEngagement.length
    : 0
  const engagementDelta = Math.max(0, avgWon - avgLost)

  return {
    baselineWinRate,
    weights: {
      source: sourceWeights,
      industry: industryWeights,
      engagement: {
        avgWonTouches: avgWon,
        avgLostTouches: avgLost,
        perTouchpoint: engagementDelta > 0 ? Math.min(0.08, engagementDelta * 0.02) : 0.03,
        maxBoost: 0.35,
      },
    },
  }
}

/**
 * Train (or retrain) the org scoring model from closed-won/lost leads.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ windowDays?: number }} [options]
 */
export async function trainScoringModel(db, orgId, options = {}) {
  const windowDays = options.windowDays || DEFAULT_WINDOW_DAYS
  const since = new Date()
  since.setDate(since.getDate() - windowDays)

  const closedLeads = await db.collection('leads').find({
    orgId,
    status: { $in: ['Won', 'won', 'WON', 'Lost', 'lost', 'LOST', 'Closed-Won', 'Closed-Lost'] },
    ...leadDateFilter(since),
  }).limit(1000).toArray()

  const wins = closedLeads.filter((l) => isWonStatus(l.status))
  const losses = closedLeads.filter((l) => isLostStatus(l.status))

  const now = new Date().toISOString()
  const dataSpanDays = closedLeads.length
    ? Math.ceil((Date.now() - Math.min(...closedLeads.map((l) => new Date(l.createdAt || l.updatedAt || now).getTime()))) / (24 * 3600_000))
    : 0

  if (wins.length < MIN_WINS_TO_TRAIN) {
    const run = {
      id: randomUUID(),
      orgId,
      status: 'skipped',
      reason: `Need at least ${MIN_WINS_TO_TRAIN} won leads (found ${wins.length})`,
      sampleSize: { wins: wins.length, losses: losses.length, total: closedLeads.length },
      dataSpanDays,
      windowDays,
      createdAt: now,
    }
    await db.collection('scoring_model_runs').insertOne(run)
    return { ok: false, skipped: true, ...run }
  }

  for (const lead of closedLeads) {
    const leadId = lead.id || lead._id?.toString()
    lead._engagement = leadId ? await computeLeadEngagement(db, orgId, leadId) : { touchpoints: 0 }
  }

  const { baselineWinRate, weights } = buildFeatureWeights(wins, losses)

  const draftModel = {
    baselineWinRate,
    weights,
    sampleSize: { wins: wins.length, losses: losses.length, total: closedLeads.length },
    dataSpanDays,
    windowDays,
  }

  const baselineAccuracy = evaluateRuleBaseline(closedLeads)
  const modelAccuracy = evaluateModelAccuracy(closedLeads, draftModel)
  const improvementPct = baselineAccuracy > 0
    ? ((modelAccuracy - baselineAccuracy) / baselineAccuracy) * 100
    : 0

  const previous = await db.collection('scoring_models').findOne(
    { orgId, active: true },
    { sort: { version: -1 } },
  )
  const version = (previous?.version || 0) + 1

  await db.collection('scoring_models').updateMany(
    { orgId, active: true },
    { $set: { active: false, deactivatedAt: now } },
  )

  const model = {
    id: randomUUID(),
    orgId,
    version,
    active: true,
    trainedAt: now,
    windowDays,
    dataSpanDays,
    baselineWinRate,
    weights,
    sampleSize: draftModel.sampleSize,
    metrics: {
      accuracy: Math.round(modelAccuracy * 1000) / 1000,
      baselineAccuracy: Math.round(baselineAccuracy * 1000) / 1000,
      improvementPct: Math.round(improvementPct * 10) / 10,
      mature: dataSpanDays >= 30,
      targetImprovementMet: dataSpanDays >= 30 && improvementPct >= 15,
    },
    createdAt: now,
  }

  await db.collection('scoring_models').insertOne(model)

  const run = {
    id: randomUUID(),
    orgId,
    modelId: model.id,
    version,
    status: 'completed',
    sampleSize: model.sampleSize,
    metrics: model.metrics,
    dataSpanDays,
    windowDays,
    createdAt: now,
  }
  await db.collection('scoring_model_runs').insertOne(run)

  const rescored = await rescoreOpenLeads(db, orgId, model)

  return {
    ok: true,
    model,
    rescored,
    message: model.metrics.targetImprovementMet
      ? `Model v${version} trained — accuracy improved ${model.metrics.improvementPct}%`
      : `Model v${version} trained on ${wins.length} wins (${model.metrics.improvementPct}% vs baseline)`,
  }
}

/**
 * Re-score open pipeline leads with the new model.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} model
 */
async function rescoreOpenLeads(db, orgId, model) {
  const openLeads = await db.collection('leads').find({
    orgId,
    status: { $nin: ['Won', 'won', 'WON', 'Lost', 'lost', 'LOST'] },
  }).limit(500).toArray()

  let updated = 0
  for (const lead of openLeads) {
    const leadId = lead.id || lead._id?.toString()
    const engagement = leadId ? await computeLeadEngagement(db, orgId, leadId) : { touchpoints: 0 }
    const result = scoreWithModel(lead, model, engagement)

    await db.collection('leads').updateOne(
      { _id: lead._id },
      {
        $set: {
          score: result.score,
          label: result.label,
          closeProbability: result.closeProbability,
          predictiveReasons: result.reasons,
          scoringEngine: result.engine,
          modelVersion: result.modelVersion,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (leadId) {
      await db.collection('lead_scores').updateOne(
        { orgId, leadId },
        {
          $set: {
            orgId,
            leadId,
            company: lead.company || lead.name,
            score: result.score,
            closeProbability: result.closeProbability,
            classification: result.label,
            reasons: result.reasons,
            engine: result.engine,
            modelVersion: result.modelVersion,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true },
      )
    }
    updated++
  }

  return updated
}

/**
 * Nightly retrain for all orgs with enough closed deals.
 * @param {import('mongodb').Db} db
 */
export async function retrainAllOrgModels(db) {
  const orgIds = await db.collection('leads').distinct('orgId')
  const reports = []

  for (const orgId of orgIds.slice(0, 100)) {
    if (!orgId) continue
    try {
      const result = await trainScoringModel(db, orgId)
      reports.push({ orgId, ...result })
    } catch (err) {
      reports.push({ orgId, ok: false, error: err.message })
    }
  }

  return reports
}
