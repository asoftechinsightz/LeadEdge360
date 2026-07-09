export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { assertProductionSecrets } from '@/lib/security/production'

export async function GET() {
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    const secrets = assertProductionSecrets()
    return NextResponse.json({
      ok: true,
      status: 'ready',
      mongo: 'connected',
      warnings: secrets.warnings || [],
      time: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      status: 'not_ready',
      error: error.message,
      time: new Date().toISOString(),
    }, { status: 503 })
  }
}
