export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { getLeadAttachment, deleteLeadAttachment } from '@/lib/leads/attachments'

export async function GET(req, { params }) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const attachment = await getLeadAttachment(db, orgId, params.id, params.attachmentId)

    const filePath = path.join(process.cwd(), 'public', attachment.url.replace(/^\//, ''))
    const buffer = await readFile(filePath)

    return new Response(buffer, {
      headers: {
        'Content-Type': attachment.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${attachment.fileName || 'attachment'}"`,
      },
    })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 })
    }
    return crmError(error)
  }
}

export async function DELETE(req, { params }) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    await deleteLeadAttachment(db, orgId, params.id, params.attachmentId)
    return NextResponse.json({ success: true, deleted: true })
  } catch (error) {
    return crmError(error)
  }
}
