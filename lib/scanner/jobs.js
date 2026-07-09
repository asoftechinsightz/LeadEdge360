import { v4 as uuid } from 'uuid'
import { getScannerCollections } from './db'
import { DEFAULT_GEO_SOURCES, resolveGeoIndustry } from './constants.js'

export async function createScannerJob({
  orgId,
  industry,
  state,
  city,
  district,
  pinCode,
  country,
  radiusKm,
  sources,
  qualityOnly,
  createdBy,
}) {
  const { jobs } = await getScannerCollections()

  const job = {
    id: uuid(),
    orgId,
    industry: resolveGeoIndustry(industry),
    state,
    city,
    district: district || '',
    pinCode: pinCode || '',
    country: country || 'India',
    radiusKm,
    sources: sources?.length ? sources : DEFAULT_GEO_SOURCES,
    qualityOnly: qualityOnly === true,
    status: 'PENDING',
    totalFound: 0,
    totalStored: 0,
    totalRejected: 0,
    totalDuplicates: 0,
    error: null,
    createdBy,
    createdAt: new Date().toISOString(),
  }

  await jobs.insertOne(job)
  return job
}

export async function listScannerJobs(orgId) {

  const { jobs } =
    await getScannerCollections()

  return jobs
    .find(
      { orgId },
      { projection:{ _id:0 } }
    )
    .sort({ createdAt:-1 })
    .limit(100)
    .toArray()
}
