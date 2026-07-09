import { NextResponse } from 'next/server'
import {
  activateSubscription, suspendSubscription, resumeSubscription, cancelSubscription,
  renewSubscription, changeSubscriptionPlan, convertTrial, expireTrial,
  processFailedPayment,
} from '@/lib/subscriptions/service'
import { guardSubscriptionRequest, subscriptionError } from '@/lib/subscriptions/api-helpers'

export async function POST(request, { params }) {
  try {
    const { orgId } = await guardSubscriptionRequest(request)
    const body = await request.json()
    const action = body.action

    const handlers = {
      activate: () => activateSubscription(orgId, params.id),
      suspend: () => suspendSubscription(orgId, params.id, body.reason),
      resume: () => resumeSubscription(orgId, params.id),
      cancel: () => cancelSubscription(orgId, params.id, body.reason),
      renew: () => renewSubscription(orgId, params.id, { manual: body.manual !== false }),
      upgrade: () => changeSubscriptionPlan(orgId, params.id, body.planCode),
      downgrade: () => changeSubscriptionPlan(orgId, params.id, body.planCode),
      convert_trial: () => convertTrial(orgId, params.id),
      expire_trial: () => expireTrial(orgId, params.id),
      payment_failed: () => processFailedPayment(orgId, params.id),
    }

    if (!handlers[action]) {
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json(await handlers[action]())
  } catch (error) {
    return subscriptionError(error)
  }
}
