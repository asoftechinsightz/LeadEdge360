import { NextResponse } from 'next/server'
import { getSubscription, cancelSubscription } from '@/lib/subscriptions/service'
import { guardSubscriptionRequest, subscriptionError } from '@/lib/subscriptions/api-helpers'

export async function GET(request, { params }) {
  try {
    const { orgId } = await guardSubscriptionRequest(request)
    const subscription = await getSubscription(orgId, params.id)
    if (!subscription) return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 })
    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    return subscriptionError(error)
  }
}

export async function PATCH(request, { params }) {
  try {
    const { orgId } = await guardSubscriptionRequest(request)
    const body = await request.json()
    if (body.action === 'cancel') {
      return NextResponse.json(await cancelSubscription(orgId, params.id, body.reason))
    }
    return NextResponse.json({ success: false, error: 'Use action-specific endpoints' }, { status: 400 })
  } catch (error) {
    return subscriptionError(error)
  }
}

export async function DELETE(request, { params }) {
  try {
    const { orgId } = await guardSubscriptionRequest(request)
    return NextResponse.json(await cancelSubscription(orgId, params.id, 'deleted'))
  } catch (error) {
    return subscriptionError(error)
  }
}
