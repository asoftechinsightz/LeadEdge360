/*
 * Legacy compatibility layer.
 * Emergent Auth has been removed.
 * JWT authentication is handled by mobile-routes/jwt.js.
 */

export async function getSessionUser() {
  return null;
}

export async function loginUrl() {
  return "/";
}

export async function exchangeSessionId() {
  return null;
}

export const AUTH_CONFIGURED = false;
