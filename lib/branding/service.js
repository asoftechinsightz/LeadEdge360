import { emptyBranding, normalizeBranding } from '@/lib/branding/schema'

const ALLOWED_SAVE_FIELDS = [
  'companyName', 'legalName', 'tagline',
  'addressLine1', 'addressLine2', 'city', 'state', 'pin', 'country',
  'gstin', 'pan', 'cin', 'phone', 'supportEmail', 'website',
  'authorizedSignatory', 'signatoryTitle',
  'logoDataUrl', 'signatureDataUrl', 'stampDataUrl',
  'primaryColor', 'secondaryColor',
  'proposalPrefix', 'invoicePrefix', 'currency', 'timezone', 'dateFormat',
  'placeOfSupply', 'gstType',
  'bankAccountName', 'bankName', 'bankAccountNumber', 'bankIfsc', 'bankBranch',
  'upiId', 'paymentLink',
  'termsAndConditions', 'invoiceNotes', 'latePaymentPolicy',
]

export async function getOrgBranding(db, orgId) {
  const [stored, profile, org] = await Promise.all([
    db.collection('org_branding').findOne({ orgId }, { projection: { _id: 0 } }),
    db.collection('onboarding_profiles').findOne({ orgId }, { projection: { _id: 0 } }),
    db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0, name: 1, ownerEmail: 1 } }),
  ])

  const legacy = await db.collection('branding_assets').findOne({ orgId }, { projection: { _id: 0 } })

  const merged = normalizeBranding({
    orgId,
    ...(profile || {}),
    companyName: stored?.companyName || profile?.companyName || org?.name || '',
    legalName: stored?.legalName || profile?.companyName || org?.name || '',
    supportEmail: stored?.supportEmail || profile?.email || org?.ownerEmail || '',
    website: stored?.website || profile?.website || '',
    addressLine1: stored?.addressLine1 || profile?.address || '',
    primaryColor: stored?.primaryColor || legacy?.primaryColor || '#0A1F44',
    secondaryColor: stored?.secondaryColor || legacy?.secondaryColor || '#0066FF',
    logoDataUrl: stored?.logoDataUrl || legacy?.logoDataUrl || '',
    ...(stored || {}),
  })

  return merged
}

export async function saveOrgBranding(db, orgId, payload = {}) {
  const update = { orgId, updatedAt: new Date().toISOString() }
  for (const key of ALLOWED_SAVE_FIELDS) {
    if (payload[key] !== undefined) update[key] = payload[key]
  }

  await db.collection('org_branding').updateOne(
    { orgId },
    { $set: update, $setOnInsert: { createdAt: new Date().toISOString() } },
    { upsert: true },
  )

  if (update.companyName || update.website || update.addressLine1) {
    await db.collection('onboarding_profiles').updateOne(
      { orgId },
      {
        $set: {
          orgId,
          companyName: update.companyName || payload.companyName,
          website: update.website || payload.website,
          address: update.addressLine1 || payload.addressLine1,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )
  }

  return getOrgBranding(db, orgId)
}

export function isBrandingConfigured(branding) {
  return Boolean(
    branding?.companyName &&
    (branding.gstin || branding.supportEmail) &&
    branding.addressLine1,
  )
}
