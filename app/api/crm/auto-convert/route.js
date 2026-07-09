export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { convertHotLeads } from '@/lib/crm-conversion/convert-hot-leads'

export async function POST() {

  const result =
    await convertHotLeads()

  return NextResponse.json({
    success: true,
    ...result
  })
}
