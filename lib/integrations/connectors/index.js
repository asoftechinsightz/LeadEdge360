import { INTEGRATIONS } from '../registry.js'
import { createStubConnector } from './base.js'
import { whatsappConnector } from './whatsapp.js'
import { razorpayConnector } from './razorpay.js'
import { gmailConnector } from './gmail.js'
import { microsoft365Connector } from './microsoft365.js'
import { googleCalendarConnector } from './google-calendar.js'
import { googleAdsConnector } from './google-ads.js'
import { facebookLeadsConnector } from './facebook-leads.js'
import { instagramConnector } from './instagram.js'
import { googleBusinessConnector } from './google-business.js'
import { linkedinConnector } from './linkedin.js'

const IMPLEMENTED = {
  whatsapp: whatsappConnector,
  razorpay: razorpayConnector,
  gmail: gmailConnector,
  microsoft365: microsoft365Connector,
  google_calendar: googleCalendarConnector,
  google_ads: googleAdsConnector,
  facebook_leads: facebookLeadsConnector,
  instagram: instagramConnector,
  google_business: googleBusinessConnector,
  linkedin: linkedinConnector,
}

export function getConnector(integrationId) {
  if (IMPLEMENTED[integrationId]) return IMPLEMENTED[integrationId]
  const def = INTEGRATIONS.find((i) => i.id === integrationId)
  if (!def) return null
  return createStubConnector(integrationId, def.phase)
}

export function listConnectors() {
  return INTEGRATIONS.map((def) => ({
    ...def,
    connector: getConnector(def.id),
  }))
}
