import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getDb } from '@/lib/mongo'
import { getQrCodeByCode, recordQrClick, recordQrScan, resolveRedirectUrl } from '@/lib/qr/service'
import { parseRequestMetadata } from '@/lib/qr/metadata'
import { isPublicQrRateLimited } from '@/lib/qr/rate-limit'

export const dynamic = 'force-dynamic'

export default async function QrRedirectPage({ params }) {
  const hdrs = headers()
  const metadata = parseRequestMetadata({
    headers: {
      get: (name) => hdrs.get(name),
    },
  })

  if (isPublicQrRateLimited(metadata.ip, params.code)) {
    redirect('/')
  }

  let target = null
  try {
    const db = await getDb()
    const doc = await getQrCodeByCode(db, params.code)
    if (doc) {
      await recordQrScan(db, params.code, metadata)
      target = await resolveRedirectUrl(db, doc.orgId, doc)
      if (target) await recordQrClick(db, params.code, metadata)
    }
  } catch {
    target = null
  }

  if (!target) {
    redirect('/')
  }

  redirect(target)
}
