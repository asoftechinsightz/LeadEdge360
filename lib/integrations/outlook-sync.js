import { fetchWithRetry } from './retry.js'
import { refreshMicrosoftTokens } from './oauth-microsoft.js'
import { ensureFreshOAuthTokens } from './connectors/base.js'
import { logEmailToLeadTimeline, parseEmailAddress, resolveLeadForEmail } from './email-timeline.js'

const GRAPH = 'https://graph.microsoft.com/v1.0'

/**
 * @param {object} creds
 */
async function resolveTokens(creds) {
  return ensureFreshOAuthTokens(creds, refreshMicrosoftTokens)
}

/**
 * @param {object} msg
 */
function mapOutlookMessage(msg) {
  const from = msg.from?.emailAddress?.address || ''
  const to = (msg.toRecipients || []).map((r) => r.emailAddress?.address).filter(Boolean).join(', ')
  const folder = String(msg.parentFolderId || '')
  const direction = msg.isDraft ? 'draft' : (msg.sentDateTime && !msg.receivedDateTime ? 'outbound' : 'inbound')

  return {
    externalMessageId: msg.id,
    threadId: msg.conversationId || '',
    subject: msg.subject || '',
    from,
    to,
    direction: direction === 'draft' ? 'inbound' : direction,
    bodyPreview: msg.bodyPreview || '',
    receivedAt: msg.receivedDateTime || msg.sentDateTime,
  }
}

/**
 * 2-way Outlook sync via Microsoft Graph — logs emails to lead timelines.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} creds
 * @param {{ maxMessages?: number }} [options]
 */
export async function syncOutlookToLeads(db, orgId, creds, options = {}) {
  const tokens = await resolveTokens(creds)
  const top = Math.min(options.maxMessages || 40, 100)

  const res = await fetchWithRetry(
    `${GRAPH}/me/messages?$top=${top}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,bodyPreview,conversationId,receivedDateTime,sentDateTime,isDraft,parentFolderId`,
    { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      ok: false,
      synced: 0,
      message: data.error?.message || `Outlook sync failed (${res.status})`,
      refreshedCredentials: tokens,
    }
  }

  const messages = data.value || []
  let synced = 0
  let skipped = 0
  const errors = []

  for (const raw of messages) {
    try {
      const msg = mapOutlookMessage(raw)
      if (msg.direction === 'draft') {
        skipped++
        continue
      }

      const leadId = await resolveLeadForEmail(db, orgId, msg)
      if (!leadId) {
        skipped++
        continue
      }

      const result = await logEmailToLeadTimeline(db, orgId, {
        leadId,
        direction: msg.direction,
        subject: msg.subject,
        from: msg.from,
        to: msg.to,
        bodyPreview: msg.bodyPreview,
        provider: 'outlook',
        externalMessageId: msg.externalMessageId,
        threadId: msg.threadId,
      })

      if (result.logged) synced++
      else skipped++
    } catch (e) {
      errors.push(e.message)
    }
  }

  return {
    ok: true,
    synced,
    skipped,
    scanned: messages.length,
    message: `Outlook: ${synced} emails logged to leads`,
    refreshedCredentials: tokens,
    errors: errors.slice(0, 5),
  }
}

/**
 * Log outbound email activity for Outlook-connected orgs.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ leadId: string, to: string, from?: string, subject: string, body?: string }} payload
 */
export async function logOutboundOutlookActivity(db, orgId, payload) {
  return logEmailToLeadTimeline(db, orgId, {
    leadId: payload.leadId,
    direction: 'outbound',
    subject: payload.subject,
    from: payload.from || '',
    to: parseEmailAddress(payload.to) || payload.to,
    bodyPreview: payload.body || '',
    provider: 'outlook',
    externalMessageId: `local-${Date.now()}`,
  })
}
