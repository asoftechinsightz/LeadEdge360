import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { buildTenantWebhookUrl } from './urls.js'

export { getWebhookBaseUrl, buildTenantWebhookUrl } from './urls.js'

/** Only organization admins may configure integrations. */
export const INTEGRATION_ADMIN_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin']

export async function guardIntegrationRead(req) {
  return guardCrmRequest(req, { permission: 'crm' })
}

export async function guardIntegrationAdmin(req) {
  return guardCrmRequest(req, { roles: INTEGRATION_ADMIN_ROLES })
}

export function integrationError(error) {
  return crmError(error)
}

export function integrationJson(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}
