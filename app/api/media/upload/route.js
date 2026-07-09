export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { guardGrowthRequest, growthError } from '@/lib/growth/api-helpers'
import { saveUploadedImage } from '@/lib/media/upload'

export async function POST(req) {
  try {
    const { orgId } = await guardGrowthRequest(req, { feature: 'business_card' })
    const form = await req.formData()
    const file = form.get('file')

    const url = await saveUploadedImage(orgId, file)
    return NextResponse.json({ success: true, url })
  } catch (error) {
    return growthError(error)
  }
}
