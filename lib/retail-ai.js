// RetailEdge360 AI: shelf-life / expiry prediction. Calls the Emergent LLM
// proxy with strict JSON output. Falls back to a deterministic heuristic when
// the LLM is unavailable.

function heuristicShelf(product) {
  // Crude category-based shelf-life defaults (days)
  const map = {
    dairy: 7, bakery: 4, produce: 6, meat: 5, beverage: 90,
    pharma: 365, cosmetic: 540, electronics: 1800, household: 720,
    other: 180,
  }
  const cat = (product.category || 'other').toLowerCase()
  const base = map[cat] ?? 180
  const ageHint = product.daysOnShelf ? Math.min(0.4, product.daysOnShelf / base) : 0
  const predictedDays = Math.max(1, Math.round(base * (1 - ageHint)))
  const risk = predictedDays <= 7 ? 'High' : predictedDays <= 21 ? 'Medium' : 'Low'
  return {
    predictedShelfDays: predictedDays,
    risk,
    recommendation:
      risk === 'High'
        ? 'Discount 30% and feature on homepage / WhatsApp blast immediately.'
        : risk === 'Medium'
        ? 'Bundle with fast-movers; cross-sell at checkout.'
        : 'Maintain regular stocking; monitor weekly.',
    reasoning: [
      `Category baseline: ${base} days for ${cat}`,
      product.daysOnShelf ? `Already ${product.daysOnShelf} days on shelf` : 'New stock',
    ],
    engine: 'rules',
  }
}

export async function predictShelfLife(product) {
  const key = process.env.EMERGENT_LLM_KEY
  if (!key) return heuristicShelf(product)
  const prompt = `You are RevenueShield AI, an expert retail inventory optimiser specialised in India FMCG/pharma/grocery. Analyse the SKU and return STRICT JSON only:
{
  "predictedShelfDays": <int>,
  "risk": "High"|"Medium"|"Low",
  "recommendation": "<one short action>",
  "reasoning": ["<bullet>", "<bullet>", "<bullet>"]
}

SKU: ${JSON.stringify(product, null, 2)}
Today: ${new Date().toISOString().slice(0, 10)}`
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 9000)
    const r = await fetch('https://integrations.emergentagent.com/llm/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!r.ok) throw new Error('llm')
    const data = await r.json()
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
    return {
      predictedShelfDays: Math.max(1, Math.round(parsed.predictedShelfDays || 30)),
      risk: ['High', 'Medium', 'Low'].includes(parsed.risk) ? parsed.risk : 'Medium',
      recommendation: parsed.recommendation || 'Monitor weekly.',
      reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning.slice(0, 5) : [],
      engine: 'llm',
    }
  } catch (e) {
    const h = heuristicShelf(product)
    h.engine = 'rules-fallback'
    h.reasoning.unshift(`LLM unavailable: ${e.message || e}`)
    return h
  }
}
