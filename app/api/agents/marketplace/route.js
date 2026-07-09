import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { crmError } from '@/lib/api/route-guards'
import { guardPlatformRequest } from '@/lib/api/platform-guard'
import {
  getMarketplaceCatalog,
  getInstalledPackages,
  installPackage,
  uninstallPackage,
} from '@/lib/agents/marketplace/manifest'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const [catalog, installed] = await Promise.all([
      Promise.resolve(getMarketplaceCatalog()),
      getInstalledPackages(db, orgId),
    ])
    return NextResponse.json({ success: true, catalog, installed })
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(req) {
  try {
    const { orgId } = await guardPlatformRequest(req)
    const db = await getDb()
    const body = await req.json()
    const { action, packageId, config } = body

    if (action === 'install') {
      const result = await installPackage(db, orgId, packageId, config || {})
      return NextResponse.json({ success: true, package: result })
    }
    if (action === 'uninstall') {
      await uninstallPackage(db, orgId, packageId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return crmError(error)
  }
}
