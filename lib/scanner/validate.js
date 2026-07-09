/** Scanner result validation — reject junk, normalize contacts */

export function normalizeCompany(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

export function normalizePhoneDigits(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length >= 10) return digits.slice(-10)
  return ''
}

export function normalizeWebsite(url) {
  if (!url) return ''
  try {
    const u = new URL(String(url).startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return String(url).trim().toLowerCase()
  }
}

/** Indian mobile + landline (10 digits, optional leading 0 / +91) */
export function validateScannerPhone(phone) {
  const raw = String(phone || '').replace(/\D/g, '')
  let digits = raw
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 10) {
    return { ok: true, normalized: `+91${digits}` }
  }
  return { ok: false }
}

/**
 * Quality tiers:
 * - verified: phone AND website
 * - partial: phone OR website
 * - listing_only: Google/Meta listing only (allowed when quality filter off)
 * - low: no contact at all
 */
export function validateScannerResult(item, { qualityOnly = true } = {}) {
  const reasons = []
  const company = String(item.company || '').trim()

  if (!company || company.length < 2) {
    reasons.push('missing_company')
  }

  if (item.businessStatus === 'CLOSED_PERMANENTLY') {
    reasons.push('permanently_closed')
  }

  const phoneCheck = validateScannerPhone(item.phone)
  const hasPhone = phoneCheck.ok
  const hasWebsite = Boolean(normalizeWebsite(item.website))
  const hasListing = Boolean(item.googleUrl || item.metaUrl || item.placeId)

  if (!hasPhone && !hasWebsite && qualityOnly) {
    reasons.push('no_contact')
  }

  let quality = 'low'
  if (hasPhone && hasWebsite) quality = 'verified'
  else if (hasPhone || hasWebsite) quality = 'partial'
  else if (hasListing) quality = 'listing_only'

  let valid = reasons.length === 0
  if (qualityOnly) {
    valid = valid && (quality === 'verified' || quality === 'partial')
  } else {
    valid = valid && quality !== 'low'
  }

  return {
    valid,
    quality,
    reasons,
    phoneNormalized: phoneCheck.normalized || '',
    companyNormalized: normalizeCompany(company),
    websiteNormalized: normalizeWebsite(item.website),
  }
}
