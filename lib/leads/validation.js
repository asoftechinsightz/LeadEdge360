/** Client-safe lead field validation */

export function validateEmail(email) {
  if (!email || !String(email).trim()) return { ok: true }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
  return ok ? { ok: true } : { ok: false, message: 'Enter a valid email address' }
}

export function normalizeIndianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return String(phone || '').trim()
}

export function validateIndianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return { ok: true, normalized: `+91${digits}` }
  if (digits.length === 12 && digits.startsWith('91')) return { ok: true, normalized: `+${digits}` }
  return { ok: false, message: 'Phone must be a 10-digit Indian mobile number' }
}

export function validateLeadCaptureForm(form) {
  if (!form.name?.trim()) return { ok: false, message: 'Full name is required' }
  const phoneCheck = validateIndianPhone(form.phone)
  if (!phoneCheck.ok) return phoneCheck
  const emailCheck = validateEmail(form.email)
  if (!emailCheck.ok) return emailCheck
  return { ok: true, phone: phoneCheck.normalized }
}
