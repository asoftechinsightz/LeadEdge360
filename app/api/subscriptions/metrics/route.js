export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSubscriptionMetrics } from '@/lib/subscriptions/service'
import { guardSubscriptionRequest, subscriptionError } from '@/lib/subscriptions/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardSubscriptionRequest(req)
    return NextResponse.json(await getSubscriptionMetrics(orgId))
  } catch (error) {
    return subscriptionError(error)
  }
}
