import { getDb } from '@/lib/mongo'

export async function getScannerCollections() {

  const db = await getDb()

  return {
    db,
    jobs: db.collection('scanner_jobs'),
    results: db.collection('scanner_results'),
    audits: db.collection('website_audits'),
    scores: db.collection('lead_scores'),
    schedules: db.collection('scan_schedules')
  }
}
