import { NextResponse } from 'next/server'
import { requireAuthenticatedTenant } from '@/lib/tenant'
import { requireRole } from '@/lib/rbac'

export async function guardCrmRequest(req, { permission = 'crm', roles = null } = {}) {
  const tenant = await requireAuthenticatedTenant(req)
  if (roles) {
    requireRole(tenant.user, roles)
  } else if (permission) {
    requireRole(tenant.user, null, permission)
  }
  return tenant
}

export function crmError(error) {
  const status = error.message === 'UNAUTHORIZED' ? 401
    : (error.message === 'FORBIDDEN' ? 403
      : (error.message === 'NOT_FOUND' ? 404
        : (error.message === 'VALIDATION_FAILED' ? 400
          : (error.message?.includes('PLAN') || error.message?.includes('SUBSCRIPTION') ? 403 : 500))))
  return NextResponse.json(
    { success: false, error: error.message, detail: error.detail || undefined },
    { status },
  )
}
