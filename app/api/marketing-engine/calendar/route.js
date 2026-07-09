import { NextResponse } from 'next/server'

import { getDb } from '@/lib/mongo'

import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

import { getMarketingCalendar, upsertCalendarEntry, updateCalendarEntry } from '@/lib/marketing-engine/content-store'



export const dynamic = 'force-dynamic'



export async function GET(req) {

  try {

    const { orgId } = await guardCrmRequest(req)

    const { searchParams } = new URL(req.url)

    const db = await getDb()

    const data = await getMarketingCalendar(db, orgId, {

      from: searchParams.get('from') || undefined,

      to: searchParams.get('to') || undefined,

    })

    return NextResponse.json({ success: true, ...data })

  } catch (error) {

    return crmError(error)

  }

}



export async function POST(req) {

  try {

    const { orgId } = await guardCrmRequest(req)

    const body = await req.json()

    const db = await getDb()

    const entry = await upsertCalendarEntry(db, orgId, {

      title: body.title,

      platform: body.platform || 'linkedin',

      scheduledAt: body.scheduledAt || new Date().toISOString(),

      slot: body.slot || '10:00',

      status: body.status || 'scheduled',

      contentId: body.contentId,

    })

    return NextResponse.json({ success: true, item: entry }, { status: 201 })

  } catch (error) {

    return crmError(error)

  }

}



export async function PATCH(req) {

  try {

    const { orgId } = await guardCrmRequest(req)

    const body = await req.json()

    if (!body.id) {

      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

    }

    const db = await getDb()

    const item = await updateCalendarEntry(db, orgId, body.id, body)

    return NextResponse.json({ success: true, item })

  } catch (error) {

    return crmError(error)

  }

}

