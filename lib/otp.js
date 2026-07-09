// OTP helpers — generate, store (hashed), verify, send via SMS (MSG91), WhatsApp, or email.
// In dev mode (no provider keys) the OTP is logged to the server console and
// also returned in the API response under `devOtp` for testing.
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { getDb } from './mongo'
import { sendWhatsApp } from './whatsapp'
import { assertOtpIpAllowed } from './auth/rate-limit'
import { toE164India } from './phone'

const OTP_TTL_SEC   = 5 * 60   // 5 min
const MAX_ATTEMPTS  = 5

function generate6() {
  return String(100000 + crypto.randomInt(0, 900000))
}

/** Normalize destination for storage and lookup (phone → E.164 India). */
export function normalizeOtpDestination(destination) {
  const raw = String(destination || '').trim()
  if (!raw) return ''
  if (raw.includes('@')) return raw.toLowerCase()
  return toE164India(raw) || raw
}

function normalizePhone(phone) {
  const e164 = toE164India(phone)
  if (!e164) return String(phone || '').replace(/\D/g, '')
  return e164.replace(/^\+/, '')
}

async function deliverOtp({ destination, code, purpose, channel }) {
  const isDevSms = channel === 'sms' && !process.env.MSG91_AUTH_KEY
  const isDevWa = channel === 'whatsapp' && (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID)
  const isDevEmail = channel === 'email' && !process.env.SMTP_USER && !process.env.SMTP_HOST

  if (isDevSms || isDevWa || isDevEmail) {
    console.log(`\n[OTP] channel=${channel} dest=${destination} purpose=${purpose} code=${code} (dev mode)\n`)
    return { ok: true, devOtp: code }
  }

  if (channel === 'whatsapp') {
    const to = normalizePhone(destination)
    const text = `Your Asoftech verification code is ${code}. Valid for 5 minutes. Do not share this code.`
    const wa = await sendWhatsApp({ to, text })
    if (!wa.ok && !wa.stored) {
      console.error('[OTP] WhatsApp send failed', wa.error)
    }
    return { ok: true }
  }

  if (channel === 'email') {
    try {
      const { sendEmail } = await import('./email/send-email')
      await sendEmail({
        fromName: 'Asoftech Business Suite',
        to: destination,
        subject: 'Your verification code',
        html: `<p>Your verification code is <strong>${code}</strong>.</p><p>Valid for 5 minutes. If you did not request this, ignore this email.</p>`,
      })
    } catch (e) {
      console.error('[OTP] email send failed', e.message)
      console.log(`\n[OTP] email fallback dest=${destination} code=${code}\n`)
      return { ok: true, devOtp: code }
    }
    return { ok: true }
  }

  // SMS via MSG91
  try {
    const url = 'https://control.msg91.com/api/v5/otp'
    const qs = new URLSearchParams({
      template_id: process.env.MSG91_TEMPLATE_ID || '',
      mobile: destination.replace(/^\+/, ''),
      authkey: process.env.MSG91_AUTH_KEY,
      otp: code,
      sender: process.env.MSG91_SENDER_ID || 'ASOFTI',
    })
    await fetch(`${url}?${qs}`, { method: 'POST' })
  } catch (e) {
    console.error('MSG91 send failed', e)
  }
  return { ok: true }
}

export async function issueOtp({ destination, purpose, channel = 'sms', ip = '' }) {
  const db = await getDb()
  const dest = normalizeOtpDestination(destination)
  if (!dest) throw new Error('VALIDATION_FAILED')
  if (ip) await assertOtpIpAllowed(db, ip)
  const code = generate6()
  await db.collection('auth_otps').updateMany(
    { destination: dest, purpose, consumedAt: null },
    { $set: { consumedAt: new Date().toISOString(), invalidated: true } },
  )
  await db.collection('auth_otps').insertOne({
    id: uuid(),
    destination: dest, channel, purpose,
    codeHash: await bcrypt.hash(code, 10),
    attempts: 0,
    expiresAt: new Date(Date.now() + OTP_TTL_SEC * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    consumedAt: null,
  })

  const sent = await deliverOtp({ destination: dest, code, purpose, channel })
  return { ...sent, destination: dest, channel }
}

export async function verifyOtp({ destination, code, purpose }) {
  const db = await getDb()
  const dest = normalizeOtpDestination(destination)
  const col = db.collection('auth_otps')
  const row = await col.findOne(
    { destination: dest, purpose, consumedAt: null },
    { sort: { createdAt: -1 } },
  )
  if (!row) return { ok: false, error: 'NO_OTP' }
  if (new Date(row.expiresAt).getTime() < Date.now()) return { ok: false, error: 'EXPIRED' }
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: 'TOO_MANY_ATTEMPTS' }

  const ok = await bcrypt.compare(String(code), row.codeHash)
  if (!ok) {
    await col.updateOne({ id: row.id }, { $inc: { attempts: 1 } })
    return { ok: false, error: 'INVALID' }
  }
  await col.updateOne({ id: row.id }, { $set: { consumedAt: new Date().toISOString() } })
  return { ok: true }
}
