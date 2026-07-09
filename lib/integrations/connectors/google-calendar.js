import { fetchWithRetry, ensureFreshOAuthTokens } from './base.js'
import { refreshGoogleTokens } from '../oauth-google.js'

export const googleCalendarConnector = {
  id: 'google_calendar',

  validateCredentials(creds) {
    if (!creds?.accessToken) return { ok: false, error: 'GOOGLE_CALENDAR_ACCESS_TOKEN_REQUIRED' }
    return { ok: true }
  },

  async resolveTokens(creds) {
    return ensureFreshOAuthTokens(creds, refreshGoogleTokens)
  },

  async testConnection(creds) {
    const tokens = await this.resolveTokens(creds)
    const res = await fetchWithRetry('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, healthy: false, message: data.error?.message || `HTTP ${res.status}`, refreshedCredentials: tokens }
    }
    const cal = data.items?.[0]
    return {
      ok: true,
      healthy: true,
      message: cal ? `Calendar: ${cal.summary}` : 'Google Calendar connected',
      metadata: { primaryCalendar: cal?.id },
      refreshedCredentials: tokens,
    }
  },

  async syncData(creds, _metadata, { orgId, db }) {
    const test = await this.testConnection(creds)
    if (!test.ok) return { ok: false, recordsSynced: 0, message: test.message }
    const tokens = test.refreshedCredentials
    const now = new Date()
    const timeMin = new Date(now.getTime() - 7 * 86400000).toISOString()
    const res = await fetchWithRetry(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=25&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    )
    const data = await res.json().catch(() => ({}))
    const events = data.items || []
    let upserted = 0
    for (const ev of events) {
      await db.collection('integration_calendar_events').updateOne(
        { orgId, integrationId: 'google_calendar', externalId: ev.id },
        {
          $set: {
            orgId,
            integrationId: 'google_calendar',
            externalId: ev.id,
            summary: ev.summary,
            start: ev.start,
            end: ev.end,
            status: ev.status,
            syncedAt: new Date().toISOString(),
          },
        },
        { upsert: true },
      )
      upserted++
    }
    return {
      ok: res.ok,
      recordsSynced: upserted,
      message: res.ok ? `Synced ${upserted} calendar events` : data.error?.message,
      refreshedCredentials: tokens,
    }
  },

  verifyWebhook() {
    return { ok: true, reason: 'google_calendar_uses_push_notifications' }
  },
}
