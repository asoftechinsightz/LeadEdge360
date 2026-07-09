import { guardCrmRequest } from '@/lib/api/route-guards'

const PLATFORM_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin']

export async function guardPlatformRequest(req) {
  return guardCrmRequest(req, { roles: PLATFORM_ROLES })
}
