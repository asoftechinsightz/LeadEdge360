/**
 * Marketing content LLM helper — uses Emergent OpenAI proxy when configured.
 * Falls back to deterministic templates (never hallucinate facts).
 */

const LLM_URL = 'https://integrations.emergentagent.com/llm/openai/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

export async function generateMarketingCopy({
  system,
  user,
  fallback,
  temperature = 0.5,
  timeoutMs = 12000,
  skipLlm = false,
}) {
  const key = process.env.EMERGENT_LLM_KEY
  if (!key || skipLlm) {
    return { text: fallback, engine: 'template', tokensUsed: 0 }
  }

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
      }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`LLM ${res.status}`)
    const data = await res.json()
    const text = String(data?.choices?.[0]?.message?.content || '').trim()
    if (!text) throw new Error('empty LLM response')
    return {
      text,
      engine: 'llm',
      tokensUsed: data?.usage?.total_tokens || 0,
    }
  } catch {
    return { text: fallback, engine: 'template-fallback', tokensUsed: 0 }
  }
}

export async function generateMarketingJson({
  system,
  user,
  fallback,
  temperature = 0.4,
  skipLlm = false,
}) {
  const key = process.env.EMERGENT_LLM_KEY
  if (!key || skipLlm) {
    return { data: fallback, engine: 'template', tokensUsed: 0 }
  }

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 15000)
    const res = await fetch(LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        response_format: { type: 'json_object' },
      }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`LLM ${res.status}`)
    const raw = await res.json()
    const content = raw?.choices?.[0]?.message?.content || '{}'
    return {
      data: JSON.parse(content),
      engine: 'llm',
      tokensUsed: raw?.usage?.total_tokens || 0,
    }
  } catch {
    return { data: fallback, engine: 'template-fallback', tokensUsed: 0 }
  }
}
