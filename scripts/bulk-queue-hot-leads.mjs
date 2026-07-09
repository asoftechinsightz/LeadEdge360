#!/usr/bin/env node
/**
 * Queue Hot leads — assign + follow-up + call task (VPS / CI).
 * Usage:
 *   npm run sales:queue-hot-leads
 *   npm run sales:queue-hot-leads -- --dry-run
 */
import { loadEnvForScripts } from '../lib/mongo-connect.js'
import { queueHotLeadsWorkflow } from '../lib/sales/bulk-hot-workflow.js'

loadEnvForScripts()

const dryRun = process.argv.includes('--dry-run')
const orgId = process.env.PILOT_ORG_ID || process.env.GROWTH_AUDIT_ORG_ID || 'asoftechinsightz'

const result = await queueHotLeadsWorkflow(orgId, {
  minScore: 80,
  limit: 100,
  dryRun,
  assignedBy: 'sales:queue-hot-leads',
})

console.log(JSON.stringify(result, null, 2))
process.exit(0)
