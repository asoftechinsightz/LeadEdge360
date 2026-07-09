export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { createLeadAttachment, listLeadAttachments } from '@/lib/leads/attachments'
import { saveUploadedDocument } from '@/lib/media/upload'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const data = await listLeadAttachments(db, orgId, params.id)
    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req, { params }) {
  try {
    const { orgId, user } = await guardCrmRequest(req)
    const db = await getDb()
    const form = await req.formData()
    const file = form.get('file')
    const saved = await saveUploadedDocument(orgId, file)
    const attachment = await createLeadAttachment(db, orgId, params.id, saved, user?.id || user?.email)
    return NextResponse.json({ success: true, attachment }, { status: 201 })
  } catch (error) {
    return crmError(error)
  }
}
