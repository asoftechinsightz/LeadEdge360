export { guardRetailRequest, retailError, RETAIL_PLANS } from '@/lib/retail/api-helpers'
import { guardRetailRequest as baseGuard } from '@/lib/retail/api-helpers'
import { canPerformAction } from './utils.js'

export async function guardExpiryRequest(req, { permission = 'crm', action = null } = {}) {
  const tenant = await baseGuard(req, { feature: 'retail_expiry', permission })
  if (action && !canPerformAction(tenant.user, action)) {
    const err = new Error('FORBIDDEN')
    err.detail = `Insufficient permissions for: ${action}`
    throw err
  }
  return tenant
}

export function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '',
    ua: req.headers.get('user-agent') || '',
  }
}
