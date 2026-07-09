import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { getOrgBranding, saveOrgBranding, isBrandingConfigured } from '@/lib/branding/service'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const branding = await getOrgBranding(db, orgId)
    return NextResponse.json({
      success: true,
      branding,
      configured: isBrandingConfigured(branding),
    })
  } catch (error) {
    return crmError(error)
  }
}

export async function PUT(req) {
  try {
    const { orgId } = await guardCrmRequest(req, { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'] })
    const body = await req.json()
    const db = await getDb()
    const branding = await saveOrgBranding(db, orgId, body)
    return NextResponse.json({
      success: true,
      branding,
      configured: isBrandingConfigured(branding),
    })
  } catch (error) {
    return crmError(error)
  }
}
