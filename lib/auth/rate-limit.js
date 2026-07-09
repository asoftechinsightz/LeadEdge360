import crypto from 'crypto'
import { v4 as uuid } from 'uuid'

const OTP_IP_LIMIT = parseInt(process.env.OTP_IP_LIMIT_PER_MIN || '3', 10)
const OTP_IP_WINDOW_MS = 60_000
const LOGIN_FAIL_LIMIT = parseInt(process.env.LOGIN_FAIL_LIMIT || '10', 10)
const LOGIN_FAIL_WINDOW_MS = 15 * 60_000

export function slidingWindowCount(timestamps, windowMs, now = Date.now()) {
  return timestamps.filter((t) => now - t < windowMs).length
}

export function deviceFingerprint({ deviceId = '', ua = '', ip = '' } = {}) {
  const raw = [String(deviceId || '').trim(), String(ua || '').slice(0, 120), String(ip || '').trim()].join('|')
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32)
}

export async function assertOtpIpAllowed(db, ip) {
  const key = String(ip || 'unknown').trim() || 'unknown'
  const col = db.collection('auth_otp_rate_limits')
  const now = Date.now()
  const row = await col.findOne({ key })
  const events = (row?.events || []).filter((t) => now - t < OTP_IP_WINDOW_MS)
  if (events.length >= OTP_IP_LIMIT) {
    const err = new Error('AUTH_OTP_RATE_LIMIT')
    err.detail = 'Too many OTP requests from this network. Try again in a minute.'
    err.retryAfterSec = Math.ceil((OTP_IP_WINDOW_MS - (now - events[0])) / 1000)
    throw err
  }
  events.push(now)
  await col.updateOne(
    { key },
    { $set: { key, events, updatedAt: new Date().toISOString() } },
    { upsert: true },
  )
}

export async function assertLoginAllowed(db, { ip = '', email = '' } = {}) {
  const col = db.collection('auth_login_attempts')
  const now = Date.now()
  const keys = [
    { type: 'ip', value: String(ip || 'unknown').trim() || 'unknown' },
    { type: 'email', value: String(email || '').trim().toLowerCase() },
  ].filter((k) => k.value)

  for (const { type, value } of keys) {
    const row = await col.findOne({ type, value })
    const failures = (row?.failures || []).filter((t) => now - t < LOGIN_FAIL_WINDOW_MS)
    if (failures.length >= LOGIN_FAIL_LIMIT) {
      const err = new Error('AUTH_LOGIN_RATE_LIMIT')
      err.detail = 'Too many failed login attempts. Try again later.'
      throw err
    }
  }
}

export async function recordLoginFailure(db, { ip = '', email = '' } = {}) {
  const col = db.collection('auth_login_attempts')
  const now = Date.now()
  const entries = [
    { type: 'ip', value: String(ip || 'unknown').trim() || 'unknown' },
    { type: 'email', value: String(email || '').trim().toLowerCase() },
  ].filter((k) => k.value)

  for (const { type, value } of entries) {
    const row = await col.findOne({ type, value })
    const failures = [...(row?.failures || []).filter((t) => now - t < LOGIN_FAIL_WINDOW_MS), now]
    await col.updateOne(
      { type, value },
      { $set: { type, value, failures, lastFailureAt: new Date().toISOString() } },
      { upsert: true },
    )
  }

  await db.collection('auth_login_anomalies').insertOne({
    id: uuid(),
    ip: ip || '',
    email: email || '',
    type: 'login_failure',
    createdAt: new Date().toISOString(),
  })
}

export async function recordLoginSuccess(db, { ip = '', email = '' } = {}) {
  const col = db.collection('auth_login_attempts')
  const targets = [
    { type: 'ip', value: String(ip || 'unknown').trim() || 'unknown' },
    { type: 'email', value: String(email || '').trim().toLowerCase() },
  ].filter((k) => k.value)
  for (const { type, value } of targets) {
    await col.updateOne({ type, value }, { $set: { failures: [], clearedAt: new Date().toISOString() } })
  }
}
