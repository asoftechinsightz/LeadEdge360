import jwt from 'jsonwebtoken'
import { getJwtSecret } from './jwt'

const EMAIL_VERIFY_TTL = parseInt(process.env.EMAIL_VERIFY_TTL || '86400', 10) // 24h

export function signEmailVerificationToken({ userId, email }) {
  return jwt.sign(
    { sub: userId, email, purpose: 'email_verify' },
    getJwtSecret(),
    { expiresIn: EMAIL_VERIFY_TTL, issuer: 'asoftechinsightz' },
  )
}

export function verifyEmailVerificationToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret(), { issuer: 'asoftechinsightz' })
    if (payload.purpose !== 'email_verify') return null
    return { userId: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

export function buildEmailVerificationUrl(token) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://asoftechinsightz.com'
  return `${base}/verify-email?token=${encodeURIComponent(token)}`
}
