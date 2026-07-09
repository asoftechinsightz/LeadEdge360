// JWT issuance + verification for the mobile API.
// Access tokens carry { sub, tenantId, role, perms } and are short-lived.
// Refresh tokens are opaque random strings, stored *hashed* in MongoDB
// `auth_refresh_tokens` collection. Rotation on every refresh.
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { v4 as uuid } from 'uuid'
import { getDb } from './mongo'

const SECRET    = process.env.JWT_SECRET || 'dev-secret-change-me'
const ACCESS_TTL  = parseInt(process.env.JWT_ACCESS_TTL  || '900',     10)
const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_TTL || '2592000', 10)

/** Returns JWT secret; throws in production if unset or default. */
export function getJwtSecret() {
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me')) {
    throw new Error('JWT_SECRET must be set in production')
  }
  return SECRET
}

function parseDeviceLabel(ua = '', device = '') {
  if (device && device !== 'android' && device !== 'web') return device
  const u = String(ua).toLowerCase()
  if (u.includes('android')) return 'Android'
  if (u.includes('iphone') || u.includes('ipad')) return 'iOS'
  if (u.includes('windows')) return 'Windows'
  if (u.includes('mac')) return 'macOS'
  if (u.includes('linux')) return 'Linux'
  return device || 'Web browser'
}

export function signAccessToken({ userId, tenantId, role, perms = [] }) {
  return jwt.sign(
    { sub: userId, tenantId, role, perms },
    SECRET,
    { expiresIn: ACCESS_TTL, issuer: 'asoftechinsightz' }
  )
}

export function verifyAccessToken(token) {
  try { return jwt.verify(token, SECRET, { issuer: 'asoftechinsightz' }) }
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

export async function revokeAllForUserExcept(userId, exceptTokenHash) {
  const db = await getDb()
  await db.collection('auth_refresh_tokens').updateMany(
    { userId, revokedAt: null, tokenHash: { $ne: exceptTokenHash } },
    { $set: { revokedAt: new Date().toISOString() } },
  )
}

export async function listUserSessions(userId) {
  const db = await getDb()
  const now = Date.now()
  const rows = await db.collection('auth_refresh_tokens')
    .find({ userId, revokedAt: null }, { projection: { _id: 0, tokenHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()
  return rows
    .filter((r) => new Date(r.expiresAt).getTime() > now)
    .map((r) => ({
      id: r.id,
      device: parseDeviceLabel(r.userAgent, r.device),
      ip: r.ip || '',
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      lastUsedAt: r.lastUsedAt || r.createdAt,
    }))
}

export async function revokeSessionById(userId, sessionId) {
  const db = await getDb()
  const res = await db.collection('auth_refresh_tokens').updateOne(
    { userId, id: sessionId, revokedAt: null },
    { $set: { revokedAt: new Date().toISOString() } },
  )
  return res.modifiedCount > 0
}

export async function touchRefreshToken(raw) {
  const db = await getDb()
  await db.collection('auth_refresh_tokens').updateOne(
    { tokenHash: hashToken(raw), revokedAt: null },
    { $set: { lastUsedAt: new Date().toISOString() } },
  )
}

export function hashRefreshToken(raw) {
  return hashToken(raw)
}

export const TOKEN_TTLS = { access: ACCESS_TTL, refresh: REFRESH_TTL }
