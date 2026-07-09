import { fetchWithRetry } from './retry.js'
import { refreshGoogleTokens } from './oauth-google.js'
import { ensureFreshOAuthTokens } from './connectors/base.js'
import { logEmailToLeadTimeline, parseEmailAddress, resolveLeadForEmail } from './email-timeline.js'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

/**
 * @param {object} creds
 */
async function resolveTokens(creds) {
  return ensureFreshOAuthTokens(creds, refreshGoogleTokens)
}

/**
 * @param {string} accessToken
 * @param {string} messageId
 */
async function fetchGmailMessage(accessToken, messageId) {
  const res = await fetchWithRetry(
    `${GMAIL_API}/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return null

  const headers = Object.fromEntries(
    (data.payload?.headers || []).map((h) => [h.name.toLowerCase(), h.value]),
  )

  const labelIds = data.labelIds || []
  const direction = labelIds.includes('SENT') ? 'outbound' : 'inbound'

  return {
    externalMessageId: data.id,
    threadId: data.threadId,
    subject: headers.subject || '',
    from: headers.from || '',
    to: headers.to || '',
    direction,
    bodyPreview: data.snippet || '',
    internalDate: data.internalDate,
  }
}

/**
 * 2-way Gmail sync — imports recent messages and logs to lead timelines.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} creds
 * @param {{ maxMessages?: number, query?: string }} [options]
 */
export async function syncGmailToLeads(db, orgId, creds, options = {}) {
  const tokens = await resolveTokens(creds)
  const maxMessages = Math.min(options.maxMessages || 40, 100)
  const query = options.query || 'newer_than:14d'

  const listRes = await fetchWithRetry(
    `${GMAIL_API}/messages?q=${encodeURIComponent(query)}&maxResults=${maxMessages}`,
    { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
  )
  const listData = await listRes.json().catch(() => ({}))
  if (!listRes.ok) {
    return {
      ok: false,
      synced: 0,
      message: listData.error?.message || `Gmail list failed (${listRes.status})`,
      refreshedCredentials: tokens,
    }
  }

  const messages = listData.messages || []
  let synced = 0
  let skipped = 0
  const errors = []

  for (const item of messages) {
    try {
      const msg = await fetchGmailMessage(tokens.accessToken, item.id)
      if (!msg) continue

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
        provider: 'gmail',
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
    message: `Gmail: ${synced} emails logged to leads`,
    refreshedCredentials: tokens,
    errors: errors.slice(0, 5),
  }
}

/**
 * Log an outbound email sent from the platform to Gmail-connected lead timeline.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ leadId: string, to: string, from?: string, subject: string, body?: string }} payload
 */
export async function logOutboundGmailActivity(db, orgId, payload) {
  return logEmailToLeadTimeline(db, orgId, {
    leadId: payload.leadId,
    direction: 'outbound',
    subject: payload.subject,
    from: payload.from || '',
    to: parseEmailAddress(payload.to) || payload.to,
    bodyPreview: payload.body || '',
    provider: 'gmail',
    externalMessageId: `local-${Date.now()}`,
  })
}
