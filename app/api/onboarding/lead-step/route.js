export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import {
  attachLeadOnboardingCookies,
  getLeadOnboardingState,
  loadLeadOnboardingProgress,
} from '@/lib/onboarding/onboarding-flow'
import {
  completeLeadOnboardingStep1,
  completeLeadOnboardingStep2,
  completeLeadOnboardingStep3,
} from '@/lib/onboarding/lead-setup-service'

const ONBOARDING_ADMIN_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin']

function withOnboardingCookies(response, state) {
  return attachLeadOnboardingCookies(response, {
    required: state.required,
    currentStep: state.currentStep,
    complete: state.complete,
  })
}

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const progress = await loadLeadOnboardingProgress(db, orgId)
    const state = getLeadOnboardingState(progress)
    const res = NextResponse.json({ progress, state })
    return withOnboardingCookies(res, state)
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardCrmRequest(req, { roles: ONBOARDING_ADMIN_ROLES })
    const body = await req.json()
    const step = Number(body.step)
    const db = await getDb()

    let result
    if (step === 1) {
      result = await completeLeadOnboardingStep1(db, orgId, body)
    } else if (step === 2) {
      result = await completeLeadOnboardingStep2(db, orgId)
    } else if (step === 3) {
      result = await completeLeadOnboardingStep3(db, orgId)
    } else {
      return NextResponse.json({ code: 'VALIDATION_FAILED', message: 'step must be 1, 2, or 3' }, { status: 400 })
    }

    const progress = await loadLeadOnboardingProgress(db, orgId)
    const state = getLeadOnboardingState(progress)
    const res = NextResponse.json({ success: true, result, state })
    return withOnboardingCookies(res, state)
  } catch (error) {
    return crmError(error)
  }
}
