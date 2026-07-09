import { getScannerCollections } from '../lib/scanner/db.js'

const { results } =
  await getScannerCollections()

await results.createIndex(
  { jobId: 1 }
)

await results.createIndex(
  { orgId: 1 }
)

await results.createIndex(
  {
    orgId: 1,
    dedupeHash: 1
  },
  {
    unique: true,
    name: 'org_dedupe_unique'
  }
)

console.log(
  'scanner_results indexes created'
)
