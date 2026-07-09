import {
  LEAD_WHATSAPP_TEMPLATES,
  listLeadWhatsAppTemplates,
  getLeadWhatsAppTemplate,
  renderLeadWhatsAppTemplate,
  leadTemplateParams,
} from '@/lib/campaigns/whatsapp-templates'

const LEGACY_TEMPLATES = [
  {
    id: 'meeting_confirm',
    name: 'meeting_confirm',
    label: 'Meeting confirmation',
    body: 'Hi {{1}}, your meeting is confirmed for {{2}}. Reply if you need to reschedule.',
    params: ['name', 'datetime'],
  },
]

export const WHATSAPP_TEMPLATES = [...LEAD_WHATSAPP_TEMPLATES, ...LEGACY_TEMPLATES]

export function listWhatsAppTemplates() {
  return [
    ...listLeadWhatsAppTemplates(),
    ...LEGACY_TEMPLATES.map(({ id, name, label, body, params }) => ({
      id,
      name,
      label,
      body,
      params,
    })),
  ]
}

export function getWhatsAppTemplate(name) {
  return WHATSAPP_TEMPLATES.find((t) => t.name === name || t.id === name) || null
}

export function renderTemplateBody(template, paramValues = []) {
  if (template?.mergeFields?.length) {
    const lead = {}
    template.mergeFields.forEach((field, i) => {
      lead[field] = paramValues[i] || ''
    })
    return renderLeadWhatsAppTemplate(template, lead)
  }
  let text = template.body
  paramValues.forEach((value, i) => {
    text = text.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), String(value || ''))
    text = text.replace(new RegExp(`\\{\\{${template.params?.[i] || i + 1}\\}\\}`, 'g'), String(value || ''))
  })
  return text
}
