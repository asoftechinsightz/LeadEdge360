import { v4 as uuid } from 'uuid'
import {
  CONSENT_VERSION,
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from '@/lib/consent-versions'

/**
 * Build a DPDP consent audit record for registration or consent updates.
 */
export function buildConsentAudit({
  termsAccepted,
  privacyRead,
  dataProcessingAccepted,
  marketingConsent = false,
  registrationMethod = 'email',
  ip = '',
  userAgent = '',
}) {
  const acceptedAt = new Date().toISOString()
  const allRequired = Boolean(termsAccepted && privacyRead && dataProcessingAccepted)
  return {
    termsAccepted: Boolean(termsAccepted),
    privacyRead: Boolean(privacyRead),
    dataProcessingAccepted: Boolean(dataProcessingAccepted),
    marketingConsent: Boolean(marketingConsent),
    accepted: allRequired,
    acceptedAt,
    consentVersion: CONSENT_VERSION,
    privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    termsVersion: TERMS_VERSION,
    registrationMethod,
    ip: ip || undefined,
    userAgent: userAgent || undefined,
    version: CONSENT_VERSION,
  }
}

export async function logConsentEvent(db, { userId, orgId, email, consent, event = 'consent_recorded' }) {
  await db.collection('consent_log').insertOne({
    id: uuid(),
    userId: userId || null,
    orgId: orgId || null,
    email: email || null,
    event,
    ...consent,
    loggedAt: new Date().toISOString(),
  })
}
