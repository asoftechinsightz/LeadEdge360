/** Canonical QR types (snake_case in storage; aliases accepted on input). */
export const QR_TYPES = [
  'business_card',
  'whatsapp',
  'review',
  'website',
  'lead_form',
  'custom_url',
]

export const QR_TYPE_SET = new Set(QR_TYPES)

const TYPE_ALIASES = {
  BUSINESS_CARD: 'business_card',
  WHATSAPP: 'whatsapp',
  REVIEW: 'review',
  WEBSITE: 'website',
  LEAD_FORM: 'lead_form',
  CUSTOM_URL: 'custom_url',
}

export function normalizeQrType(value) {
  const raw = String(value || 'business_card').trim()
  if (QR_TYPE_SET.has(raw)) return raw
  const alias = TYPE_ALIASES[raw.toUpperCase()]
  if (alias) return alias
  return raw
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
