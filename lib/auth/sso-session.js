import crypto from 'crypto'
import { signAccessToken, issueRefreshToken, TOKEN_TTLS } from '@/lib/jwt'

export function pickUser(u) {
  if (!u) return null
  const { passwordHash, _id, ...rest } = u
  return rest
}

/**
 * Issue web auth exchange code (same pattern as Google OAuth callback).
 * @param {import('mongodb').Db} db
 * @param {object} user
 * @param {object} ctx
 */
export async function issueSsoWebSession(db, user, ctx = {}) {
  const accessToken = signAccessToken({
    userId: user.id,
    tenantId: user.orgId,
    role: user.role || 'member',
    perms: [],
  })
  const refreshToken = await issueRefreshToken({
    userId: user.id,
    device: ctx.device || 'web',
    ip: ctx.ip || '',
    ua: ctx.ua || '',
  })

  const exchangeCode = crypto.randomBytes(24).toString('hex')
  await db.collection('auth_exchange_codes').insertOne({
    code: exchangeCode,
    accessToken,
    refreshToken,
    expiresIn: TOKEN_TTLS.access,
    user: pickUser(user),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    consumedAt: null,
  })

  return { exchangeCode, accessToken, refreshToken }
}
