/**
 * Public marketing site routes (enterprise theme).
 */
export const MARKETING_PATHS = [
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

const AUTH_PREFIXES = [
  '/signin',
  '/signup',
  '/login',
  '/splash',
  '/product-selection',
  '/forgot-password',
  '/portal',
]

export function isMarketingPath(pathname = '') {
  if (!pathname) return false
  if (AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false
  }
  return MARKETING_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)),
  )
}
