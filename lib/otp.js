// OTP helpers — generate, store (hashed), verify, send via MSG91/email stub.
// In dev mode (no MSG91_AUTH_KEY) the OTP is logged to the server console and
// also returned in the API response under `devOtp` for testing.
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { getDb } from './mongo.js'

const OTP_TTL_SEC   = 5 * 60   // 5 min
const MAX_ATTEMPTS  = 5

function generate6() {
  // 100000–999999
  return String(100000 + crypto.randomInt(0, 900000))
}

export async function issueOtp({ destination, purpose, channel = 'sms' }) {
  const code = generate6()
  const db = await getDb()
  // Invalidate any active OTP for the same destination + purpose
  await db.collection('auth_otps').updateMany(
    { destination, purpose, consumedAt: null },
    { $set: { consumedAt: new Date().toISOString(), invalidated: true } }
  )
  await db.collection('auth_otps').insertOne({
    id: uuid(),
    destination, channel, purpose,
    codeHash: await bcrypt.hash(code, 10),
    attempts: 0,
    expiresAt: new Date(Date.now() + OTP_TTL_SEC * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    consumedAt: null,
  })

  // Send
  const isDev = !process.env.MSG91_AUTH_KEY
  if (isDev) {
    console.log(`\n[OTP] dest=${destination}  purpose=${purpose}  code=${code}  (dev mode — set MSG91_AUTH_KEY to send real SMS)\n`)
    return { ok: true, devOtp: code }
  }

  // Real MSG91 send
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

export async function verifyOtp({ destination, code, purpose }) {
  const db = await getDb()
  const col = db.collection('auth_otps')
  const row = await col.findOne(
    { destination, purpose, consumedAt: null },
    { sort: { createdAt: -1 } }
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
