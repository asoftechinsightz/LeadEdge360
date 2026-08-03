// Unified request actor for JWT and cookie-bridge paths (E-002).
// Handlers receive the same shape regardless of auth mechanism.

export const BRIDGE_ROOTS = ['followups', 'dashboard', 'whatsapp', 'notifications', 'admin', 'users']

export function isWebJwtBridgeEnabled() {
  return process.env.WEB_JWT_BRIDGE === 'true'
}

/** @typedef {{ userId: string, orgId: string, role: string, email: string, user: object }} RequestActor */

export function buildRequestActor(user) {
  if (!user?.id || !user?.orgId) return null
  return {
    userId: user.id,
    orgId: user.orgId,
    role: user.role || 'admin',
    email: user.email,
    user,
  }
}

export function isBridgedRoot(root) {
  return BRIDGE_ROOTS.includes(root)
}

/**
 * Dispatch policy for the catch-all API router.
 * jwt — Bearer token present → mobileRoute JWT path
 * bridge — cookie session + flag on → shared handlers
 * bridge_disabled_404 — bridged root, no bearer, flag off
 * legacy — cookie paths (leads, kpis, billing, etc.)
 */
export function resolveAuthDispatch({ root, hasBearer, bridgeEnabled }) {
  if (hasBearer) return 'jwt'
  if (!isBridgedRoot(root)) return 'legacy'
  if (!bridgeEnabled) return 'bridge_disabled_404'
  return 'bridge'
}
