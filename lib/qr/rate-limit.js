const WINDOW_MS = 60_000
const MAX_PER_IP = 120
const MAX_PER_CODE = 60
const buckets = new Map()

function touch(key, limit) {
  const now = Date.now()
  let entry = buckets.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(key, entry)
  }
  entry.count += 1
  return entry.count > limit
}

/** Returns true when the client should be rate limited. */
export function isPublicQrRateLimited(ip, code) {
  const clientIp = ip || 'unknown'
  if (touch(`qr:ip:${clientIp}`, MAX_PER_IP)) return true
  if (code && touch(`qr:code:${code}:${clientIp}`, MAX_PER_CODE)) return true
  return false
}
