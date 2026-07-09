import { listActivities } from '@/lib/activities/service'

/**
 * Backward-compatible wrapper — delegates to unified activity feed.
 */
export async function getRecentActivities(dbIn, orgId, { limit = 20 } = {}) {
  return listActivities(dbIn, orgId, { limit, syncLegacy: true })
}
