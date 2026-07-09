import crypto from 'crypto'
import zlib from 'zlib'
import { getDb } from '@/lib/mongo'
import { buildGoogleAuthUrl, isGoogleAuthConfigured } from '@/lib/google-auth'

const COLLECTION = 'org_sso_settings'

export const SSO_PROVIDERS = {
  SAML: 'saml',
  GOOGLE_WORKSPACE: 'google_workspace',
}

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '')
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function getOrgSsoConfig(db, orgId) {
  const doc = await db.collection(COLLECTION).findOne({ orgId }, { projection: { _id: 0 } })
  return doc || {
    orgId,
    enabled: false,
    providers: {
      saml: { enabled: false },
      google_workspace: { enabled: false },
    },
  }
}

/**
 * Normalize allowed domains to lowercase array.
 * @param {string|string[]} raw
 */
function normalizeDomains(raw) {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : String(raw).split(',')
  return list.map((d) => d.trim().toLowerCase().replace(/^@/, '')).filter(Boolean)
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {object} patch
 * @param {string} userId
 */
export async function saveOrgSsoConfig(db, orgId, patch, userId) {
  const now = new Date().toISOString()
  const existing = await getOrgSsoConfig(db, orgId)

  const providers = {
    ...existing.providers,
    ...(patch.providers || {}),
  }

  if (patch.saml) {
    const saml = { ...existing.providers?.saml, ...patch.saml }
    if (saml.allowedDomains !== undefined) {
      saml.allowedDomains = normalizeDomains(saml.allowedDomains)
    }
    providers.saml = saml
  }
  if (patch.google_workspace) {
    const gw = { ...existing.providers?.google_workspace, ...patch.google_workspace }
    if (gw.hostedDomain) gw.hostedDomain = String(gw.hostedDomain).toLowerCase().replace(/^@/, '')
    providers.google_workspace = gw
  }

  const enabled = Boolean(
    patch.enabled ?? (
      providers.saml?.enabled || providers.google_workspace?.enabled
    ),
  )

  const doc = {
    orgId,
    enabled,
    providers,
    updatedAt: now,
    updatedBy: userId,
  }

  await db.collection(COLLECTION).updateOne(
    { orgId },
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )

  return getOrgSsoConfig(db, orgId)
}

/**
 * @param {object} config
 */
export function isSsoEnabledForOrg(config) {
  if (!config?.enabled) return false
  return Boolean(config.providers?.saml?.enabled || config.providers?.google_workspace?.enabled)
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} emailDomain
 */
export async function findOrgByEmailDomain(db, emailDomain) {
  const domain = String(emailDomain || '').toLowerCase().replace(/^@/, '')
  if (!domain) return null

  const byWorkspace = await db.collection(COLLECTION).findOne({
    'providers.google_workspace.enabled': true,
    'providers.google_workspace.hostedDomain': domain,
  })
  if (byWorkspace) {
    const org = await db.collection('orgs').findOne({ id: byWorkspace.orgId })
    return { orgId: byWorkspace.orgId, org, sso: byWorkspace, provider: SSO_PROVIDERS.GOOGLE_WORKSPACE }
  }

  const bySaml = await db.collection(COLLECTION).findOne({
    'providers.saml.enabled': true,
    'providers.saml.allowedDomains': domain,
  })
  if (bySaml) {
    const org = await db.collection('orgs').findOne({ id: bySaml.orgId })
    return { orgId: bySaml.orgId, org, sso: bySaml, provider: SSO_PROVIDERS.SAML }
  }

  return null
}

/**
 * Build SAML 2.0 SP-initiated redirect URL (HTTP-Redirect binding).
 * @param {object} samlConfig
 * @param {{ orgId: string, relayState?: string }} ctx
 */
export function buildSamlLoginUrl(samlConfig, ctx) {
  if (!samlConfig?.idpSsoUrl || !samlConfig?.enabled) {
    throw new Error('SAML SSO is not configured')
  }

  const requestId = `_${crypto.randomUUID()}`
  const issueInstant = new Date().toISOString()
  const spEntityId = samlConfig.spEntityId || `${appBaseUrl()}/api/auth/sso/saml/metadata`
  const acsUrl = samlConfig.acsUrl || `${appBaseUrl()}/api/auth/sso/saml/callback`

  const authnRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  ID="${requestId}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  Destination="${samlConfig.idpSsoUrl}"
  AssertionConsumerServiceURL="${acsUrl}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${spEntityId}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`

  const deflated = zlib.deflateRawSync(Buffer.from(authnRequest))
  const encoded = deflated.toString('base64')
  const url = new URL(samlConfig.idpSsoUrl)
  url.searchParams.set('SAMLRequest', encoded)
  if (ctx.relayState) url.searchParams.set('RelayState', ctx.relayState)
  url.searchParams.set('SigAlg', 'urn:oasis:names:tc:SAML:2.0:alg:sha256')

  return { url: url.toString(), requestId, acsUrl }
}

/**
 * Decode SAMLResponse and extract identity attributes.
 * @param {string} samlResponseBase64
 * @param {object} samlConfig
 */
export function parseSamlResponse(samlResponseBase64, samlConfig = {}) {
  if (!samlResponseBase64) throw new Error('Missing SAMLResponse')

  const raw = Buffer.from(samlResponseBase64, 'base64')
  let xml
  try {
    xml = zlib.inflateRawSync(raw).toString('utf8')
  } catch {
    xml = raw.toString('utf8')
  }

  const email =
    extractXmlValue(xml, 'NameID')
    || extractXmlValue(xml, 'email')
    || extractXmlValue(xml, 'mail')
    || extractAttribute(xml, 'email')
    || extractAttribute(xml, 'mail')
    || extractAttribute(xml, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')

  if (!email || !email.includes('@')) {
    throw new Error('SAML assertion did not contain a valid email')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const domain = normalizedEmail.split('@')[1]

  const allowed = normalizeDomains(samlConfig.allowedDomains)
  if (allowed.length && !allowed.includes(domain)) {
    throw new Error(`Email domain @${domain} is not allowed for this organization`)
  }

  const fullName =
    extractAttribute(xml, 'displayName')
    || extractAttribute(xml, 'name')
    || extractAttribute(xml, 'givenName')
    || normalizedEmail.split('@')[0]

  return {
    email: normalizedEmail,
    fullName: String(fullName).trim(),
    samlSessionIndex: extractXmlValue(xml, 'SessionIndex') || null,
    issuer: extractXmlValue(xml, 'Issuer') || samlConfig.idpEntityId || null,
  }
}

function extractXmlValue(xml, tag) {
  const re = new RegExp(`<(?:[\\w-]+:)?${tag}[^>]*>([^<]+)<\\/(?:[\\w-]+:)?${tag}>`, 'i')
  const m = xml.match(re)
  return m?.[1]?.trim() || ''
}

function extractAttribute(xml, name) {
  const re = new RegExp(
    `<(?:[\\w-]+:)?Attribute[^>]*Name="${name}"[^>]*>\\s*<(?:[\\w-]+:)?AttributeValue[^>]*>([^<]+)<`,
    'i',
  )
  const m = xml.match(re)
  return m?.[1]?.trim() || ''
}

/**
 * Google Workspace SSO — OIDC with hosted domain (hd) restriction.
 * @param {object} workspaceConfig
 * @param {{ orgId: string, state?: string }} ctx
 */
export function buildGoogleWorkspaceSsoUrl(workspaceConfig, ctx) {
  if (!workspaceConfig?.enabled || !workspaceConfig?.hostedDomain) {
    throw new Error('Google Workspace SSO is not configured')
  }
  if (!isGoogleAuthConfigured()) {
    throw new Error('Google OAuth is not configured on server')
  }

  const redirectUri = `${appBaseUrl()}/api/auth/sso/google/callback`
  const statePayload = Buffer.from(JSON.stringify({
    orgId: ctx.orgId,
    nonce: ctx.state || crypto.randomBytes(8).toString('hex'),
  })).toString('base64url')

  const base = buildGoogleAuthUrl({ redirectUri, state: statePayload })
  const url = new URL(base)
  url.searchParams.set('hd', workspaceConfig.hostedDomain)
  url.searchParams.set('prompt', 'select_account')
  return url.toString()
}

/**
 * Validate Google Workspace SSO profile against org config.
 * @param {object} profile
 * @param {object} workspaceConfig
 */
export function validateGoogleWorkspaceProfile(profile, workspaceConfig) {
  const hd = workspaceConfig?.hostedDomain?.toLowerCase()
  const email = String(profile?.email || '').toLowerCase()
  if (!email.endsWith(`@${hd}`)) {
    throw new Error(`Account must be a @${hd} Google Workspace user`)
  }
  return {
    email,
    fullName: profile.fullName || email.split('@')[0],
    googleId: profile.googleId,
    picture: profile.picture || null,
  }
}

/**
 * Find or create a user within an SSO-enabled organization.
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ email: string, fullName?: string, picture?: string, googleId?: string, ssoProvider?: string }} profile
 */
export async function provisionSsoUser(db, orgId, profile) {
  const { v4: uuid } = await import('uuid')
  const email = String(profile.email || '').trim().toLowerCase()
  if (!email) throw new Error('SSO profile missing email')

  let user = await db.collection('users').findOne({
    $or: [{ email }, ...(profile.googleId ? [{ googleId: profile.googleId }] : [])],
  })

  if (user) {
    if (user.orgId !== orgId) {
      throw new Error('This account belongs to another organization')
    }
    const update = {
      emailVerified: true,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
    if (profile.googleId) update.googleId = profile.googleId
    if (profile.picture && !user.picture) update.picture = profile.picture
    if (profile.fullName && !user.fullName) update.fullName = profile.fullName
    if (user.status === 'invited') update.status = 'active'
    await db.collection('users').updateOne({ id: user.id }, { $set: update })
    return db.collection('users').findOne({ id: user.id })
  }

  user = {
    id: uuid(),
    orgId,
    email,
    fullName: profile.fullName || email.split('@')[0],
    picture: profile.picture || null,
    googleId: profile.googleId || null,
    role: 'member',
    status: 'active',
    businessSuiteEnabled: true,
    products: ['leadedge360'],
    activeProduct: 'leadedge360',
    emailVerified: true,
    phoneVerified: false,
    ssoProvider: profile.ssoProvider || null,
    preferences: { notifications: { push: true, email: true, whatsapp: true } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  }
  await db.collection('users').insertOne(user)
  return user
}

/**
 * SP metadata XML for IdP configuration.
 * @param {string} orgId
 */
export function buildSpMetadata(orgId) {
  const base = appBaseUrl()
  const entityId = `${base}/api/auth/sso/saml/metadata?orgId=${orgId}`
  const acs = `${base}/api/auth/sso/saml/callback?orgId=${orgId}`
  return `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
  <SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acs}" index="1"/>
  </SPSSODescriptor>
</EntityDescriptor>`
}
