// JWT issuance + verification for the mobile API.
// Access tokens carry { sub, tenantId, role, perms } and are short-lived.
// Refresh tokens are opaque random strings, stored *hashed* in MongoDB
// `auth_refresh_tokens` collection. Rotation on every refresh.
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { getDb } from './mongo.js'
import { getJwtSecret } from './security-config.js'
const ACCESS_TTL  = parseInt(process.env.JWT_ACCESS_TTL  || '900',     10)
const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_TTL || '2592000', 10)

export function signAccessToken({ userId, tenantId, role, perms = [] }) {
  return jwt.sign(
    { sub: userId, tenantId, role, perms },
    getJwtSecret(),
    { expiresIn: ACCESS_TTL, issuer: 'asoftechinsightz' }
  )
}

export function verifyAccessToken(token) {
  try { return jwt.verify(token, getJwtSecret(), { issuer: 'asoftechinsightz' }) }
  catch (e) { return null }
}

function hashToken(t) { return crypto.createHash('sha256').update(t).digest('hex') }

export async function issueRefreshToken({ userId, device = '', ip = '', ua = '' }) {
  const raw = crypto.randomBytes(40).toString('hex')
  const db = await getDb()
  await db.collection('auth_refresh_tokens').insertOne({
    id: uuid(),
    userId,
    tokenHash: hashToken(raw),
    device, ip, userAgent: ua,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + REFRESH_TTL * 1000).toISOString(),
    revokedAt: null,
  })
  return raw
}

export async function rotateRefreshToken(oldRaw, ctx = {}) {
  const db = await getDb()
  const doc = await db.collection('auth_refresh_tokens').findOne({
    tokenHash: hashToken(oldRaw), revokedAt: null,
  })
  if (!doc) return null
  if (new Date(doc.expiresAt).getTime() < Date.now()) return null
  await db.collection('auth_refresh_tokens').updateOne({ id: doc.id }, { $set: { revokedAt: new Date().toISOString() } })
  const fresh = await issueRefreshToken({ userId: doc.userId, ...ctx })
  return { userId: doc.userId, refreshToken: fresh }
}

export async function revokeRefreshToken(raw) {
  const db = await getDb()
  await db.collection('auth_refresh_tokens').updateOne(
    { tokenHash: hashToken(raw) }, { $set: { revokedAt: new Date().toISOString() } }
  )
}

export async function revokeAllForUser(userId) {
  const db = await getDb()
  await db.collection('auth_refresh_tokens').updateMany(
    { userId, revokedAt: null }, { $set: { revokedAt: new Date().toISOString() } }
  )
}

export const TOKEN_TTLS = { access: ACCESS_TTL, refresh: REFRESH_TTL }
