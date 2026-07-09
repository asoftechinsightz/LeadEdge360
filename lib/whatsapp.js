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

/** Upload PDF buffer to WhatsApp Cloud media library. */
export async function uploadWhatsAppMedia(pdfBuffer, filename = 'receipt.pdf') {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneId || !token) {
    return { ok: false, reason: 'whatsapp-not-configured' }
  }

  const form = new FormData()
  form.append('messaging_product', 'whatsapp')
  form.append('type', 'application/pdf')
  form.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), filename)

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json }
    return { ok: true, mediaId: json.id }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

/** Send a document message via WhatsApp Cloud API. */
export async function sendWhatsAppDocument({ to, mediaId, filename = 'bill.pdf', caption = '' }) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneId || !token) {
    return { ok: false, stored: true, reason: 'whatsapp-not-configured' }
  }

  const normalized = String(to || '').replace(/\D/g, '')
  const body = {
    messaging_product: 'whatsapp',
    to: normalized,
    type: 'document',
    document: {
      id: mediaId,
      filename,
      ...(caption ? { caption: String(caption).slice(0, 1024) } : {}),
    },
  }

  try {
    const r = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
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
