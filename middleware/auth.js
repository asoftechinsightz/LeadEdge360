import { NextResponse } from 'next/server'
import {
  LEAD_ONBOARDING_COMPLETE_COOKIE,
  LEAD_ONBOARDING_TRIAL_COOKIE,
  isLeadOnboardingGatedPath,
  isOnboardingExemptPath,
} from '@/lib/onboarding/onboarding-flow'
import { LEADS_LIST_PATH } from '@/lib/leads/paths'

/**
 * Gate LeadEdge360 dashboard routes for trial users until onboarding step 3 is complete.
 * Relies on cookies synced at login / onboarding progress updates.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {import('next/server').NextResponse | null}
 */
export function checkLeadOnboardingGate(request) {
  const pathname = request.nextUrl.pathname

  if (!isLeadOnboardingGatedPath(pathname)) return null
  if (isOnboardingExemptPath(pathname)) return null

  const trialFlag = request.cookies.get(LEAD_ONBOARDING_TRIAL_COOKIE)?.value
  if (trialFlag !== '1') return null

  const completeFlag = request.cookies.get(LEAD_ONBOARDING_COMPLETE_COOKIE)?.value
  if (completeFlag === '1') return null

  // Step 3: allow canonical Leads list + detail during AI score tour.
  if (
    pathname === LEADS_LIST_PATH
    || pathname.startsWith(`${LEADS_LIST_PATH}/`)
    || pathname === '/leads'
    || pathname.startsWith('/leads/')
  ) return null

  const url = request.nextUrl.clone()
  url.pathname = '/onboarding'
  url.searchParams.set('returnUrl', pathname)
  return NextResponse.redirect(url)
}

/**
 * @param {import('next/server').NextRequest} request
 * @returns {import('next/server').NextResponse | null}
 */
export function checkAuthOnboarding(request) {
  return checkLeadOnboardingGate(request)
}
