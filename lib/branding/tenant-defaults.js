import { getOrgBranding } from '@/lib/branding/service'

/** Default product / line-item label for an org (never hardcode platform vendor name). */
export async function getTenantProductName(db, orgId) {
  const branding = await getOrgBranding(db, orgId)
  return branding.companyName || branding.legalName || 'Services'
}

export async function getTenantCompanyName(db, orgId) {
  const branding = await getOrgBranding(db, orgId)
  return branding.legalName || branding.companyName || 'Customer'
}

export async function getTenantEmailFromName(db, orgId) {
  const branding = await getOrgBranding(db, orgId)
  return branding.companyName || branding.legalName || branding.supportEmail?.split('@')[0] || 'Sales'
}
