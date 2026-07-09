export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import {
  createSubscription, listSubscriptions, getSubscriptionMetrics,
  exportSubscriptionsCsv, createTrial,
} from '@/lib/subscriptions/service'
import { guardSubscriptionRequest, subscriptionError } from '@/lib/subscriptions/api-helpers'

export async function GET(req) {
  try {
    const { orgId } = await guardSubscriptionRequest(req)
    const { searchParams } = new URL(req.url)
    if (searchParams.get('format') === 'csv') {
      const data = await exportSubscriptionsCsv(orgId)
      return new Response(data.csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=subscriptions-export.csv',
          'X-Row-Count': String(data.rowCount),
        },
      })
    }
    if (searchParams.get('metrics') === '1') {
      return NextResponse.json(await getSubscriptionMetrics(orgId))
    }
    return NextResponse.json(await listSubscriptions(orgId, {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      customerId: searchParams.get('customerId'),
    }))
  } catch (error) {
    return subscriptionError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardSubscriptionRequest(req)
    const body = await req.json()
    if (body.trial) {
      return NextResponse.json(await createTrial(orgId, body))
    }
    return NextResponse.json(await createSubscription(orgId, body))
  } catch (error) {
    return subscriptionError(error)
  }
}
