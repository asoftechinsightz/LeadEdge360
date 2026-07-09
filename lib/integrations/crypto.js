import crypto from 'crypto'

function deriveKey() {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.JWT_SECRET || ''
  if (!raw || raw === 'dev-secret-change-me') {
    if (process.env.NODE_ENV === 'production' && process.env.PAT_STAGE === 'production') {
      throw new Error('INTEGRATION_ENCRYPTION_KEY_OR_JWT_SECRET_REQUIRED')
    }
  }
  return crypto.createHash('sha256').update(String(raw || 'dev-integration-key')).digest()
}

/** Encrypt integration credentials for per-tenant storage (AES-256-GCM). */
export function encryptCredentials(payload) {
  const key = deriveKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plain = JSON.stringify(payload ?? {})
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

/** Decrypt stored credential blob. */
export function decryptCredentials(blob) {
  if (!blob) return null
  const key = deriveKey()
  const buf = Buffer.from(blob, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const data = buf.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const plain = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  return JSON.parse(plain)
}

/** Redact secrets for API responses. */
export function redactCredentials(creds = {}) {
  const out = { ...creds }
  for (const k of Object.keys(out)) {
    if (/secret|token|password|key/i.test(k) && out[k]) {
      out[k] = '••••••••'
    }
  }
  return out
}
