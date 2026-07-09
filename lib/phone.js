/**
 * Normalize Indian mobile numbers to E.164 (+91XXXXXXXXXX).
 */
export function toE164India(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`
  if (String(phone).trim().startsWith('+')) return `+${digits}`
  return digits.length >= 10 ? `+${digits}` : ''
}

export function phonesMatch(a, b) {
  const da = String(a || '').replace(/\D/g, '').slice(-10)
  const db = String(b || '').replace(/\D/g, '').slice(-10)
  return da.length === 10 && da === db
}
