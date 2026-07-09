/**
 * Canonical auth navigation paths for the Business Suite shell.
 * Always use these helpers — never relative paths like `signin`.
 */

export const SIGN_IN_PATH = '/signin' as const;

/** Suite routes that require JWT via SuiteAuthProvider. */
export const SUITE_AUTH_GUARD_PATHS = [
  '/dashboard',
  '/leads',
  '/opportunities',
  '/leadedge360',
  '/retailedge360',
  '/proposals',
  '/invoices',
  '/revenue',
  '/analytics',
  '/settings',
  '/payments',
  '/onboarding',
  '/campaigns',
  '/growth',
  '/partners/dashboard',
] as const;

/**
 * True when pathname is a protected suite route (prefix match).
 */
export function isSuiteAuthGuardPath(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return SUITE_AUTH_GUARD_PATHS.some(
    (guard) => path === guard || path.startsWith(`${guard}/`),
  );
}

/**
 * Normalize an app path to a root-absolute path (leading `/`).
 */
export function normalizeAppPath(path: string): string {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Build the sign-in URL with an optional post-login return path.
 */
export function buildSignInUrl(returnPath?: string | null): string {
  if (!returnPath) return SIGN_IN_PATH;
  return `${SIGN_IN_PATH}?returnUrl=${encodeURIComponent(normalizeAppPath(returnPath))}`;
}

/**
 * Hard redirect to sign-in from any route segment.
 * Uses root-absolute paths only — prevents `/design-system-preview/signin` style 404s.
 */
export function redirectToSignIn(returnPath?: string | null): void {
  if (typeof window === 'undefined') return;
  window.location.assign(buildSignInUrl(returnPath));
}

/**
 * Resolve post-login destination from ?returnUrl= query param.
 */
export function resolveReturnUrl(search: string, fallback = '/splash'): string {
  const value = new URLSearchParams(search).get('returnUrl');
  if (!value) return fallback;
  const decoded = decodeURIComponent(value);
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;
  return decoded;
}
