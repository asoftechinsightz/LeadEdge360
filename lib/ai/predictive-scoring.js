import { ruleScore } from '@/lib/scoring'

const WON_STATUSES = new Set(['won', 'closed-won', 'closed won'])
const LOST_STATUSES = new Set(['lost', 'closed-lost', 'closed lost'])

/**
 * @param {string} status
 */
export function isWonStatus(status) {
  return WON_STATUSES.has(String(status || '').trim().toLowerCase())
}

/**
 * @param {string} status
 */
export function isLostStatus(status) {
  return LOST_STATUSES.has(String(status || '').trim().toLowerCase())
}

/**
 * @param {number} p
 */
export function sigmoid(p) {
  return 1 / (1 + Math.exp(-p))
}

/**
 * @param {number} prob
 */
export function probabilityToLogOdds(prob) {
  const p = Math.min(0.99, Math.max(0.01, prob))
  return Math.log(p / (1 - p))
}

/**
 * Load the latest trained scoring model for an org.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function loadScoringModel(db, orgId) {
  const model = await db.collection('scoring_models').findOne(
    { orgId, active: true },
    { sort: { version: -1 }, projection: { _id: 0 } },
  )
  return model || null
}

/**
 * Compute engagement touchpoints for a lead.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} leadId
 */
export async function computeLeadEngagement(db, orgId, leadId) {
  const ids = [leadId]
  const [timelineCount, followupCount, taskCount, noteCount] = await Promise.all([
    db.collection('lead_timeline').countDocuments({ orgId, leadId: { $in: ids } }),
    db.collection('follow_ups').countDocuments({ orgId, leadId: { $in: ids } }),
    db.collection('lead_tasks').countDocuments({ orgId, leadId: { $in: ids } }),
    db.collection('lead_notes').countDocuments({ orgId, leadId: { $in: ids } }),
  ])

  const touchpoints = timelineCount + followupCount + taskCount + noteCount
  const whatsappTouches = await db.collection('lead_timeline').countDocuments({
    orgId,
    leadId: { $in: ids },
    type: { $in: ['whatsapp_sent', 'whatsapp_received', 'whatsapp_delivered'] },
  })
  const emailTouches = await db.collection('lead_timeline').countDocuments({
    orgId,
    leadId: { $in: ids },
    type: { $in: ['email_sent', 'email_received'] },
  })

  return {
    touchpoints,
    whatsappTouches,
    emailTouches,
    score: touchpoints + whatsappTouches * 0.5 + emailTouches * 0.25,
  }
}

/**
 * Build human-readable reasons from feature contributions.
 * @param {object} lead
 * @param {object} model
 * @param {object} engagement
 * @param {object} contributions
 */
function buildPredictiveReasons(lead, model, engagement, contributions) {
  const reasons = []
  const source = String(lead.source || 'unknown').toLowerCase()
  const industry = String(lead.industry || lead.demoIndustry || 'unknown')

  if (contributions.source > 0.02) {
    const winPct = Math.round((model.weights?.source?.[source]?.winRate || 0) * 100)
    reasons.push(`+${Math.round(contributions.source * 100)}% ${source} leads win ${winPct}% of the time`)
  } else if (contributions.source < -0.02) {
    reasons.push(`${source} source historically converts below average`)
  }

  if (contributions.industry > 0.02 && industry !== 'unknown') {
    const winPct = Math.round((model.weights?.industry?.[industry]?.winRate || 0) * 100)
    reasons.push(`+${Math.round(contributions.industry * 100)}% ${industry} closes at ${winPct}%`)
  }

  if (engagement.touchpoints > 0) {
    if (contributions.engagement > 0.02) {
      reasons.push(`+${Math.round(contributions.engagement * 100)}% strong engagement (${engagement.touchpoints} touchpoints)`)
    } else if (engagement.touchpoints >= 3) {
      reasons.push(`${engagement.touchpoints} CRM touchpoints logged`)
    }
  } else {
    reasons.push('Low engagement so far — nurture recommended')
  }

  if (lead.budget && Number(lead.budget) >= 50000) {
    reasons.push('Budget signal ≥ ₹50k')
  }

  if (lead.whatsapp) {
    reasons.push('WhatsApp opt-in improves response rates')
  }

  if (model?.metrics?.improvementPct >= 15) {
    reasons.push(`Model trained on ${model.sampleSize?.wins || 0} recent wins (+${Math.round(model.metrics.improvementPct)}% accuracy)`)
  }

  return reasons.slice(0, 6)
}

/**
 * Score a lead using the trained predictive model.
 * @param {object} lead
 * @param {object|null} model
 * @param {object} [engagement]
 */
export function scoreWithModel(lead, model, engagement = { touchpoints: 0, score: 0 }) {
  if (!model?.weights) {
    const fallback = ruleScore(lead)
    return {
      score: fallback.score,
      closeProbability: fallback.score,
      label: fallback.label,
      reasons: fallback.reasons,
      engine: fallback.engine || 'rules',
      modelVersion: null,
    }
  }

  const baseline = model.baselineWinRate || 0.15
  let logOdds = probabilityToLogOdds(baseline)
  const contributions = { source: 0, industry: 0, engagement: 0 }

  const source = String(lead.source || 'unknown').toLowerCase()
  const industry = String(lead.industry || lead.demoIndustry || '').trim()

  const sourceStats = model.weights.source?.[source]
  if (sourceStats?.logOddsDelta) {
    logOdds += sourceStats.logOddsDelta
    contributions.source = sourceStats.logOddsDelta * 0.12
  }

  const industryStats = model.weights.industry?.[industry]
  if (industry && industryStats?.logOddsDelta) {
    logOdds += industryStats.logOddsDelta
    contributions.industry = industryStats.logOddsDelta * 0.12
  }

  const engCfg = model.weights.engagement || {}
  const touchBoost = Math.min(
    engCfg.maxBoost || 0.35,
    (engagement.touchpoints || 0) * (engCfg.perTouchpoint || 0.04),
  )
  if (touchBoost > 0) {
    logOdds += touchBoost * 2
    contributions.engagement = touchBoost
  }

  const closeProbability = Math.round(sigmoid(logOdds) * 100)
  const score = closeProbability
  const label = score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold'
  const reasons = buildPredictiveReasons(lead, model, engagement, contributions)

  return {
    score,
    closeProbability,
    label,
    reasons,
    engine: 'predictive',
    modelVersion: model.version,
    contributions,
  }
}

/**
 * Full predictive score for a CRM lead (loads model + engagement).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} lead
 */
export async function predictiveScoreLead(db, orgId, lead) {
  const model = await loadScoringModel(db, orgId)
  const leadId = lead.id || lead._id?.toString()
  const engagement = leadId
    ? await computeLeadEngagement(db, orgId, leadId)
    : { touchpoints: 0, score: 0 }

  return scoreWithModel(lead, model, engagement)
}

/**
 * Evaluate rule-based baseline accuracy on labeled leads.
 * @param {object[]} labeledLeads
 */
export function evaluateRuleBaseline(labeledLeads) {
  if (!labeledLeads.length) return 0.5
  let correct = 0
  for (const lead of labeledLeads) {
    const actual = isWonStatus(lead.status)
    const predicted = ruleScore(lead).score >= 50
    if (predicted === actual) correct++
  }
  return correct / labeledLeads.length
}

/**
 * Evaluate predictive model accuracy on labeled leads.
 * @param {object[]} labeledLeads
 * @param {object} model
 */
export function evaluateModelAccuracy(labeledLeads, model) {
  if (!labeledLeads.length) return 0.5
  let correct = 0
  for (const lead of labeledLeads) {
    const actual = isWonStatus(lead.status)
    const predicted = scoreWithModel(lead, model, lead._engagement || { touchpoints: 0 }).closeProbability >= 50
    if (predicted === actual) correct++
  }
  return correct / labeledLeads.length
}
