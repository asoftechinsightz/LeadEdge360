import { sendMessage } from '@/lib/whatsapp/service'
import {
  getLeadWhatsAppTemplate,
  leadTemplateParams,
  renderLeadWhatsAppTemplate,
} from '@/lib/campaigns/whatsapp-templates'
import {
  trackWhatsAppSent,
} from '@/lib/analytics/track-whatsapp'

const INTRO_TEMPLATE_ID = 'new_lead'

/**
 * Send the standard new-lead WhatsApp intro for a CRM lead (1-click action).
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} userId
 * @param {Record<string, unknown>} lead
 * @param {{ ip?: string, ua?: string, templateId?: string }} [meta]
 */
export async function sendLeadWhatsAppIntro(db, orgId, userId, lead, meta = {}) {
  const templateId = meta.templateId || INTRO_TEMPLATE_ID
  return sendLeadWhatsAppTemplate(db, orgId, userId, lead, templateId, meta)
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} userId
 * @param {Record<string, unknown>} lead
 * @param {string} templateId
 * @param {{ ip?: string, ua?: string }} [meta]
 */
export async function sendLeadWhatsAppTemplate(db, orgId, userId, lead, templateId, meta = {}) {
  if (!lead?.phone) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Lead has no phone number'
    throw err
  }

  const template = getLeadWhatsAppTemplate(templateId)
  if (!template) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Unknown WhatsApp template'
    throw err
  }

  const params = leadTemplateParams(template, lead)
  const previewText = renderLeadWhatsAppTemplate(template, lead)

  const result = await sendMessage(
    db,
    orgId,
    userId,
    '',
    {
      templateName: template.name,
      params,
      text: previewText,
      contactPhone: lead.phone,
      contactName: lead.name,
      leadId: lead.id,
    },
    { ip: meta.ip, ua: meta.ua },
  )

  const message = result.message
  const thread = result.thread

  await trackWhatsAppSent(db, {
    orgId,
    leadId: lead.id,
    threadId: thread?.id,
    messageId: message?.id,
    templateName: template.name,
    userId,
    waMessageId: message?.waMessageId || '',
    metadata: { channel: 'whatsapp', intro: templateId === INTRO_TEMPLATE_ID },
  })

  await db.collection('leads').updateOne(
    { orgId, id: lead.id },
    {
      $set: {
        lastWhatsAppAt: new Date().toISOString(),
        lastWhatsAppTemplate: template.name,
        updatedAt: new Date().toISOString(),
      },
    },
  )

  return {
    thread,
    message,
    previewText,
    template: template.name,
  }
}
