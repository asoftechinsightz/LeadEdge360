import { createOpportunityRecord } from './service'

/** @deprecated Use createOpportunityRecord from service.js */
export async function createOpportunity(body) {
  return createOpportunityRecord(body)
}
