/**
 * LeadEdge360 WhatsApp message templates (Meta Cloud API + merge-field preview).
 */

export const LEAD_WHATSAPP_TEMPLATES = [
  {
    id: 'new_lead',
    name: 'new_lead',
    label: 'New Lead',
    body: 'Hi {{name}}, thanks for your interest in {{company}}. Can we connect?',
    params: ['name', 'company'],
    mergeFields: ['name', 'company'],
  },
  {
    id: 'follow_up',
    name: 'follow_up',
    label: 'Follow-up',
    body: 'Hi {{name}}, following up on your inquiry about {{company}}. Are you available for a quick call this week?',
    params: ['name', 'company'],
    mergeFields: ['name', 'company'],
  },
  {
    id: 'proposal_sent',
    name: 'proposal_sent',
    label: 'Proposal Sent',
    body: 'Hi {{name}}, we have shared a proposal for {{company}}. Please review and let us know your feedback.',
    params: ['name', 'company'],
    mergeFields: ['name', 'company'],
  },
]

/**
 * @param {string} [templateId]
 */
export function getLeadWhatsAppTemplate(templateId = 'new_lead') {
  return LEAD_WHATSAPP_TEMPLATES.find(
    (t) => t.id === templateId || t.name === templateId,
  ) || null
}

export function listLeadWhatsAppTemplates() {
  return LEAD_WHATSAPP_TEMPLATES.map(({ id, name, label, body, params }) => ({
    id,
    name,
    label,
    body,
    params,
  }))
}

/**
 * Render merge-field body for preview / text fallback.
 * @param {{ body?: string, mergeFields?: string[] }} template
 * @param {Record<string, string>} lead
 */
export function renderLeadWhatsAppTemplate(template, lead = {}) {
  let text = String(template?.body || '')
  const fields = template?.mergeFields || template?.params || []
  for (const field of fields) {
    const value = lead[field] ?? (field === 'company' ? lead.company || 'our services' : '')
    text = text.replaceAll(`{{${field}}}`, String(value))
  }
  return text
}

/**
 * Ordered parameter values for Meta template API ({{1}}, {{2}}, …).
 * @param {{ params?: string[] }} template
 * @param {Record<string, string>} lead
 */
export function leadTemplateParams(template, lead = {}) {
  return (template?.params || []).map((field) => {
    if (field === 'company') return String(lead.company || 'our services')
    return String(lead[field] || '')
  })
}
