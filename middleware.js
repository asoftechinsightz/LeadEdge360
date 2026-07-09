import { NextResponse } from 'next/server'
import {
  DOMAINS,
  isMarketingHost,
  isMarketingOnlyPath,
  isSuitePath,
  isAuthPath,
} from '@/lib/domains'
import { checkAuthOnboarding } from '@/middleware/auth'

const WINDOW_MS = 60_000
const MAX_AUTH_REQUESTS = 40
const buckets = new Map()

function clientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
  return `${ip}:${request.nextUrl.pathname}`
}

function isRateLimited(key) {
  const now = Date.now()
  let entry = buckets.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(key, entry)
  }
  entry.count += 1
  return entry.count > MAX_AUTH_REQUESTS
}

function redirectTo(request, hostname, pathname) {
  const url = request.nextUrl.clone()
  url.hostname = hostname
  url.protocol = 'https'
  url.pathname = pathname ?? request.nextUrl.pathname
  return NextResponse.redirect(url, 301)
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  const hostname = (request.headers.get('host') || '').split(':')[0].toLowerCase()

  // Marketing apex: auth + suite → app subdomain
  if (isMarketingHost(hostname)) {
    if (isAuthPath(pathname) || isSuitePath(pathname)) {
      return redirectTo(request, DOMAINS.suite)
    }
  }

  // Business Suite: marketing-only pages → apex (keep /api on app host)
  if (hostname === DOMAINS.suite && isMarketingOnlyPath(pathname) && pathname !== '/') {
    return redirectTo(request, DOMAINS.marketing)
  }

  // Business Suite root → dashboard entry
  if (hostname === DOMAINS.suite && pathname === '/') {
    return redirectTo(request, DOMAINS.suite, '/dashboard')
  }

  // API subdomain requests that reach Next.js directly (nginx normally handles)
  if (hostname === DOMAINS.suiteApi && !pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/api${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  const onboardingGate = checkAuthOnboarding(request)
  if (onboardingGate) return onboardingGate

  if (!pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  const key = clientKey(request)
  if (isRateLimited(key)) {
    return NextResponse.json(
      { code: 'RATE_LIMITED', message: 'Too many authentication requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|downloads).*)',
    '/api/auth/:path*',
  ],
}
