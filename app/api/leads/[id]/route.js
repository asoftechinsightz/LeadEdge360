export const dynamic = 'force-dynamic'



import { NextResponse } from 'next/server'

import { getDb } from '@/lib/mongo'

import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

import { getLeadDetail, softDeleteLead, restoreLead, patchLead } from '@/lib/leads/service'



function requestMeta(req) {

  return {

    ip: req.headers.get('x-forwarded-for') || '',

    ua: req.headers.get('user-agent') || '',

  }

}



export async function GET(req, { params }) {

  try {

    const { orgId } = await guardCrmRequest(req)

    const db = await getDb()

    const detail = await getLeadDetail(db, orgId, params.id)

    return NextResponse.json({

      success: true,

      ...detail,

      lead: detail.lead,

    })

  } catch (error) {

    if (error.message === 'NOT_FOUND') {

      console.warn('[leads] GET detail not found', {

        leadId: params?.id,

        detail: error.detail,

      })

    }

    return crmError(error)

  }

}



export async function PATCH(req, { params }) {

  try {

    const { orgId, user } = await guardCrmRequest(req)

    const body = await req.json()

    const db = await getDb()

    const data = await patchLead(db, orgId, user.id, params.id, body, requestMeta(req))

    return NextResponse.json({ success: true, ...data })

  } catch (error) {

    return crmError(error)

  }

}



export async function DELETE(req, { params }) {

  try {

    const { orgId, user } = await guardCrmRequest(req)

    const db = await getDb()

    const data = await softDeleteLead(db, orgId, user.id, params.id, requestMeta(req))

    return NextResponse.json({ success: true, ...data })

  } catch (error) {

    return crmError(error)

  }

}



export async function POST(req, { params }) {

  try {

    const { orgId, user } = await guardCrmRequest(req, { roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'admin', 'superadmin'] })

    const body = await req.json().catch(() => ({}))

    if (body.action !== 'restore') {

      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })

    }

    const db = await getDb()

    const data = await restoreLead(db, orgId, user.id, params.id, requestMeta(req))

    return NextResponse.json({ success: true, ...data })

  } catch (error) {

    return crmError(error)

  }

}


