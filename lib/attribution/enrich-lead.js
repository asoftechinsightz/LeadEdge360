import { resolveMetaLeadAttribution } from '../integrations/meta-ads.js'
import { resolveGoogleLeadAttribution } from '../integrations/google-ads.js'

/**
 * Resolve ad attribution when a lead is ingested.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {string} source
 * @param {object} body
 */
export async function resolveLeadAttribution(db, orgId, source, body) {
  const payload = { ...body, source: source || body.source }
  if (source === 'facebook' || payload.source === 'facebook') {
    return resolveMetaLeadAttribution(db, orgId, payload)
  }
  if (source === 'google' || payload.source === 'google') {
    return resolveGoogleLeadAttribution(db, orgId, payload)
  }
  return null
}
