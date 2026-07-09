import { getIntegrationDef } from './registry.js'
import {
  buildGoogleIntegrationAuthUrl,
  exchangeGoogleIntegrationCode,
  isGoogleIntegrationOAuthConfigured,
} from './oauth-google.js'
import {
  buildMicrosoftAuthUrl,
  exchangeMicrosoftCode,
  isMicrosoftOAuthConfigured,
} from './oauth-microsoft.js'
import {
  buildMetaAuthUrl,
  exchangeMetaCode,
  isMetaOAuthConfigured,
} from './oauth-meta.js'
import {
  buildLinkedInAuthUrl,
  exchangeLinkedInCode,
  isLinkedInOAuthConfigured,
} from './oauth-linkedin.js'

const GOOGLE_IDS = new Set(['gmail', 'google_calendar', 'google_ads', 'google_business'])
const META_IDS = new Set(['facebook_leads', 'instagram'])
const MS_IDS = new Set(['microsoft365'])
const LINKEDIN_IDS = new Set(['linkedin'])

export function getOAuthProvider(integrationId) {
  if (GOOGLE_IDS.has(integrationId)) return 'google'
  if (META_IDS.has(integrationId)) return 'meta'
  if (MS_IDS.has(integrationId)) return 'microsoft'
  if (LINKEDIN_IDS.has(integrationId)) return 'linkedin'
  return null
}

export function isOAuthConfiguredFor(integrationId) {
  const provider = getOAuthProvider(integrationId)
  if (provider === 'google') return isGoogleIntegrationOAuthConfigured()
  if (provider === 'meta') return isMetaOAuthConfigured()
  if (provider === 'microsoft') return isMicrosoftOAuthConfigured()
  if (provider === 'linkedin') return isLinkedInOAuthConfigured()
  return false
}

export function providerLabel(integrationId) {
  const map = { google: 'Google', meta: 'Meta', microsoft: 'Microsoft', linkedin: 'LinkedIn' }
  return map[getOAuthProvider(integrationId)] || 'OAuth'
}

export function buildIntegrationOAuthUrl(integrationId, { redirectUri, state }) {
  const def = getIntegrationDef(integrationId)
  const scopes = def?.oauthScopes || []
  const provider = getOAuthProvider(integrationId)
  if (provider === 'google') {
    return buildGoogleIntegrationAuthUrl({ redirectUri, state, scopes })
  }
  if (provider === 'meta') {
    return buildMetaAuthUrl({ redirectUri, state, scopes })
  }
  if (provider === 'microsoft') {
    return buildMicrosoftAuthUrl({ redirectUri, state, scopes })
  }
  if (provider === 'linkedin') {
    return buildLinkedInAuthUrl({ redirectUri, state, scopes })
  }
  return null
}

export async function exchangeIntegrationOAuthCode(integrationId, code, redirectUri) {
  const provider = getOAuthProvider(integrationId)
  if (provider === 'google') return exchangeGoogleIntegrationCode(code, redirectUri)
  if (provider === 'meta') return exchangeMetaCode(code, redirectUri)
  if (provider === 'microsoft') return exchangeMicrosoftCode(code, redirectUri)
  if (provider === 'linkedin') return exchangeLinkedInCode(code, redirectUri)
  throw new Error('UNSUPPORTED_OAUTH_INTEGRATION')
}
