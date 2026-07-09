/**
 * Canonical domain map — AsoftechInsightz platform surfaces.
 *
 * | Host | Surface |
 * |------|---------|
 * | asoftechinsightz.com | Marketing website |
 * | app.asoftechinsightz.com | Business Suite (LeadEdge360, RetailEdge360, CRM) |
 * | api.asoftechinsightz.com | Business Suite REST API |
 * | app.observability360.asoftechinsightz.com | Observability360 / Trinetra360 UI |
 * | api-observability360.asoftechinsightz.com | Observability360 API gateway |
 */

export const DOMAINS = {
  marketing: 'asoftechinsightz.com',
  marketingWww: 'www.asoftechinsightz.com',
  suite: 'app.asoftechinsightz.com',
  suiteApi: 'api.asoftechinsightz.com',
  observabilityApp: 'app.observability360.asoftechinsightz.com',
  observabilityApi: 'api-observability360.asoftechinsightz.com',
}

export const URLS = {
  marketing: `https://${DOMAINS.marketing}`,
  suite: `https://${DOMAINS.suite}`,
  suiteApi: `https://${DOMAINS.suiteApi}`,
  observabilityApp: `https://${DOMAINS.observabilityApp}`,
  observabilityApi: `https://${DOMAINS.observabilityApi}`,
}

const MARKETING_HOSTS = new Set([
  DOMAINS.marketing,
  DOMAINS.marketingWww,
])

const SUITE_HOSTS = new Set([
  DOMAINS.suite,
  DOMAINS.suiteApi,
])

/** Paths served only on the marketing apex (public site). */
export const MARKETING_ONLY_PREFIXES = [
  '/',
  '/about',
  '/solutions',
  '/services',
  '/industries',
  '/pricing',
  '/blog',
  '/partners',
  '/contact',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/cancellation-policy',
  '/cookie-policy',
  '/shipping-delivery',
  '/acceptable-use',
  '/download',
  '/products',
  '/growth-audit',
  '/company',
  '/book-demo',
  '/customers',
  '/resources',
]

/** Paths served on app.asoftechinsightz.com (authenticated business suite). */
export const SUITE_PREFIXES = [
  '/dashboard',
  '/leads',
  '/opportunities',
  '/leadedge360',
  '/retailedge360',
  '/proposals',
  '/invoices',
  '/revenue',
  '/campaigns',
  '/analytics',
  '/settings',
  '/payments',
  '/onboarding',
  '/growth',
  '/ops',
  '/subscribe',
  '/signin',
  '/signup',
  '/splash',
  '/product-selection',
  '/portal',
  '/verify-email',
]

const AUTH_PREFIXES = ['/signin', '/signup', '/splash', '/product-selection', '/portal']

export function normalizeHost(host = '') {
  return host.split(':')[0].toLowerCase()
}

export function isMarketingHost(host) {
  return MARKETING_HOSTS.has(normalizeHost(host))
}

export function isSuiteHost(host) {
  return SUITE_HOSTS.has(normalizeHost(host))
}

export function isAuthPath(pathname = '') {
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function isMarketingOnlyPath(pathname = '') {
  if (!pathname) return false
  if (pathname.startsWith('/api/')) return false
  return MARKETING_ONLY_PREFIXES.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)),
  )
}

export function isSuitePath(pathname = '') {
  if (!pathname) return false
  if (pathname.startsWith('/api/')) return false
  return SUITE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export function suiteUrl(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${URLS.suite}${p}`
}

export function marketingUrl(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${URLS.marketing}${p}`
}
