// Minimal WhatsApp Cloud API send wrapper. Falls back to a stored-only message
// when the Meta token isn't configured (so the UI/mobile flow still works in dev).
export async function sendWhatsApp({ to, text, templateName, params }) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token   = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneId || !token) {
    return { ok: false, stored: true, reason: 'whatsapp-not-configured', echo: { to, text, templateName, params } }
  }
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`
  const body = templateName
    ? {
        messaging_product: 'whatsapp', to,
        type: 'template',
        template: {
          name: templateName, language: { code: 'en' },
          components: (params && params.length)
            ? [{ type: 'body', parameters: params.map(t => ({ type: 'text', text: t })) }]
            : [],
        },
      }
    : { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const j = await r.json()
    if (!r.ok) return { ok: false, stored: true, error: j }
    return { ok: true, waMessageId: j.messages?.[0]?.id }
  } catch (e) {
    return { ok: false, stored: true, error: e.message }
  }
}
