// AI Lead Scoring
// Tries Emergent LLM key (OpenAI-compatible) first. Falls back to a transparent
// rule-based scorer if the key is missing or the call fails. Returns: { score, label, reasons }

const KEYWORD_WEIGHTS = {
  urgent: 12, asap: 10, immediately: 10,
  buy: 14, purchase: 12, order: 12,
  demo: 10, trial: 8, pricing: 8, quote: 10, proposal: 9,
  interested: 6, looking: 5, need: 5, want: 5,
  budget: 10, ready: 8, decision: 7,
  whatsapp: 4, call: 3, meeting: 6,
}
const SOURCE_BASELINE = {
  whatsapp: 18, website: 14, google: 16, facebook: 12, referral: 20, other: 8,
}

export function ruleScore(lead) {
  let score = 25
  const reasons = []

  const src = (lead.source || 'website').toLowerCase()
  const base = SOURCE_BASELINE[src] ?? 10
  score += base
  reasons.push(`+${base} source baseline (${src})`)

  if (lead.email && /@/.test(lead.email)) { score += 8; reasons.push('+8 valid email') }
  if (lead.phone && lead.phone.replace(/\D/g,'').length >= 10) { score += 10; reasons.push('+10 valid phone') }
  if (lead.whatsapp) { score += 6; reasons.push('+6 WhatsApp opt-in') }
  if (lead.budget && Number(lead.budget) >= 50000) { score += 10; reasons.push('+10 budget >= 50k') }
  if (lead.territory) { score += 4; reasons.push('+4 territory mapped') }
  if (lead.company) { score += 3; reasons.push('+3 company provided') }

  const text = `${lead.message || ''} ${lead.notes || ''}`.toLowerCase()
  for (const [kw, w] of Object.entries(KEYWORD_WEIGHTS)) {
    if (text.includes(kw)) { score += w; reasons.push(`+${w} keyword “${kw}”`) }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))
  const label = score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold'
  return { score, label, reasons, engine: 'rules' }
}

export async function aiScore(lead) {
  const key = process.env.EMERGENT_LLM_KEY
  if (!key) return ruleScore(lead)

  const prompt = `You are an expert B2B/B2C sales qualification AI. Score this incoming lead from 0 to 100 based on likelihood to convert in the next 30 days. Consider source, intent signals in the message, contact quality, budget, and urgency. Be strict. Return STRICT JSON only: {"score": <0-100>, "label": "Hot"|"Warm"|"Cold", "reasons": ["...","...","..."]}.\n\nLead:\n${JSON.stringify(lead, null, 2)}`

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 9000)
    const r = await fetch('https://integrations.emergentagent.com/llm/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!r.ok) throw new Error(`LLM ${r.status}`)
    const data = await r.json()
    const txt = data?.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(txt)
    const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)))
    const label = parsed.label || (score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold')
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 6) : []
    return { score, label, reasons, engine: 'llm' }
  } catch (e) {
    const rs = ruleScore(lead)
    rs.engine = 'rules-fallback'
    rs.reasons.unshift(`(LLM unavailable: ${e.message || e})`)
    return rs
  }
}
