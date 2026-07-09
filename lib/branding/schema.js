/**
 * Normalized tenant branding for PDFs and settings UI.
 * All tenant-facing fields come from the database — no hardcoded company identity.
 */

export const BRANDING_FIELDS = [
  'companyName',
  'legalName',
  'tagline',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'pin',
  'country',
  'gstin',
  'pan',
  'cin',
  'phone',
  'supportEmail',
  'website',
  'authorizedSignatory',
  'signatoryTitle',
  'logoDataUrl',
  'signatureDataUrl',
  'stampDataUrl',
  'primaryColor',
  'secondaryColor',
  'proposalPrefix',
  'invoicePrefix',
  'currency',
  'timezone',
  'dateFormat',
  'placeOfSupply',
  'gstType',
  'bankAccountName',
  'bankName',
  'bankAccountNumber',
  'bankIfsc',
  'bankBranch',
  'upiId',
  'paymentLink',
  'termsAndConditions',
  'invoiceNotes',
  'latePaymentPolicy',
]

/** Platform attribution only — not tenant company data */
export const PLATFORM_FOOTER = 'Powered by LeadEdge360'

export function emptyBranding(orgId = '') {
  return {
    orgId,
    companyName: '',
    legalName: '',
    tagline: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pin: '',
    country: 'India',
    gstin: '',
    pan: '',
    cin: '',
    phone: '',
    supportEmail: '',
    website: '',
    authorizedSignatory: '',
    signatoryTitle: '',
    logoDataUrl: '',
    signatureDataUrl: '',
    stampDataUrl: '',
    primaryColor: '#0A1F44',
    secondaryColor: '#0066FF',
    proposalPrefix: 'PROP',
    invoicePrefix: 'INV',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'en-IN',
    placeOfSupply: '',
    gstType: 'CGST_SGST',
    bankAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankBranch: '',
    upiId: '',
    paymentLink: '',
    termsAndConditions: [],
    invoiceNotes: '',
    latePaymentPolicy: '',
  }
}

export function normalizeBranding(raw = {}) {
  const base = emptyBranding(raw.orgId)
  const merged = { ...base, ...raw }

  const addressParts = [
    merged.addressLine1,
    merged.addressLine2,
    [merged.city, merged.state, merged.pin].filter(Boolean).join(', '),
    merged.country,
  ].filter(Boolean)

  merged.fullAddress = addressParts.join('\n')
  merged.displayName = merged.legalName || merged.companyName || ''
  merged.termsAndConditions = Array.isArray(merged.termsAndConditions)
    ? merged.termsAndConditions
    : (merged.termsAndConditions ? String(merged.termsAndConditions).split('\n').filter(Boolean) : [])

  return merged
}

export function formatBrandDate(value, branding) {
  const d = value ? new Date(value) : new Date()
  if (Number.isNaN(d.getTime())) return '—'
  try {
    return d.toLocaleDateString(branding.dateFormat || 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: branding.timezone || 'Asia/Kolkata',
    })
  } catch {
    return d.toLocaleDateString('en-IN')
  }
}

export function formatBrandCurrency(amount, branding) {
  const n = Number(amount || 0)
  const currency = branding.currency || 'INR'
  if (currency === 'INR') {
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return new Intl.NumberFormat(branding.dateFormat || 'en-IN', { style: 'currency', currency }).format(n)
}
