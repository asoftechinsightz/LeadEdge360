import { aiScore, ruleScore } from '@/lib/scoring'
import { predictiveScoreLead, loadScoringModel } from '@/lib/ai/predictive-scoring'

const TEMPLATES = {
  followup: (lead) =>
    `Hi ${lead.name || 'there'}, thanks for reaching out${lead.company ? ` from ${lead.company}` : ''}. I'd love to learn more about your goals. When is a good time for a quick call?`,
  proposal: (lead) =>
    `Hi ${lead.name || 'there'}, I've prepared a proposal tailored for ${lead.company || 'your business'}. Shall I share it over email or WhatsApp?`,
  nurture: (lead) =>
    `Hi ${lead.name || 'there'}, checking in to see if you had a chance to review our solution. Happy to answer any questions.`,
}

export async function suggestLeadReply(lead, { intent = 'followup', tone = 'professional' } = {}) {
  const key = process.env.EMERGENT_LLM_KEY
  const fallback = TEMPLATES[intent] || TEMPLATES.followup
  const templateText = fallback(lead)

  if (!key) {
    return { suggestion: templateText, engine: 'template', intents: Object.keys(TEMPLATES) }
  }

  const prompt = `Write a ${tone} WhatsApp sales reply (max 320 chars) for this lead. Intent: ${intent}. Return JSON: {"suggestion":"..."} only.\n\nLead:\n${JSON.stringify({
    name: lead.name,
    company: lead.company,
    message: lead.message,
    status: lead.status,
    budget: lead.budget,
  })}`

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 9000)
    const r = await fetch('https://integrations.emergentagent.com/llm/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!r.ok) throw new Error(`LLM ${r.status}`)
    const data = await r.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    const suggestion = String(parsed.suggestion || templateText).trim()
    return { suggestion, engine: 'llm', intents: Object.keys(TEMPLATES) }
  } catch {
    return { suggestion: templateText, engine: 'template-fallback', intents: Object.keys(TEMPLATES) }
  }
}

export async function scoreLeadForOrg(db, orgId, leadId) {
  const lead = await db.collection('leads').findOne({ orgId, id: leadId }, { projection: { _id: 0 } })
  if (!lead) {
    const err = new Error('NOT_FOUND')
    throw err
  }

  const model = await loadScoringModel(db, orgId)
  const result = model?.weights
    ? await predictiveScoreLead(db, orgId, lead)
    : await aiScore(lead)
  const now = new Date().toISOString()

  await db.collection('lead_scores').updateOne(
    { orgId, leadId },
    {
      $set: {
        orgId,
        leadId,
        company: lead.company || lead.name,
        score: result.score,
        closeProbability: result.closeProbability ?? result.score,
        classification: result.label,
        reasons: result.reasons,
        engine: result.engine,
        modelVersion: result.modelVersion || null,
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  await db.collection('leads').updateOne(
    { orgId, id: leadId },
    {
      $set: {
        score: result.score,
        label: result.label,
        closeProbability: result.closeProbability ?? result.score,
        predictiveReasons: result.reasons,
        scoringEngine: result.engine,
        modelVersion: result.modelVersion || null,
        updatedAt: now,
      },
    },
  )

  return { leadId, ...result }
}

export { ruleScore, aiScore }
