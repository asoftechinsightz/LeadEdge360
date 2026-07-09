import { getTool } from '@/lib/agents/tools/registry'
import { assertAgentToolAccess } from '@/lib/agents/security'

async function searchLeads(db, orgId, { query = '', limit = 20 } = {}) {
  const filter = { orgId }
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ]
  }
  return db.collection('leads')
    .find(filter, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .limit(Math.min(limit, 50))
    .toArray()
}

async function lookupCustomer(db, orgId, { leadId, company } = {}) {
  if (leadId) {
    return db.collection('leads').findOne({ orgId, id: leadId }, { projection: { _id: 0 } })
  }
  if (company) {
    return db.collection('leads').findOne({ orgId, company }, { projection: { _id: 0 } })
  }
  return null
}

async function searchDocuments(db, orgId, { query = '', limit = 10 } = {}) {
  const filter = { orgId }
  if (query) filter.documentNumber = { $regex: query, $options: 'i' }
  return db.collection('document_versions')
    .find(filter, { projection: { _id: 0, snapshot: 0 } })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 20))
    .toArray()
}

async function generateReport(db, orgId, { reportType = 'pipeline' } = {}) {
  const [leadCount, oppCount, wonCount] = await Promise.all([
    db.collection('leads').countDocuments({ orgId }),
    db.collection('opportunities').countDocuments({ orgId }),
    db.collection('opportunities').countDocuments({ orgId, stage: 'WON' }),
  ])
  return { reportType, leadCount, oppCount, wonCount, generatedAt: new Date().toISOString() }
}

const TOOL_HANDLERS = {
  crm_search: (db, orgId, params) => searchLeads(db, orgId, params),
  lead_search: (db, orgId, params) => searchLeads(db, orgId, params),
  customer_lookup: (db, orgId, params) => lookupCustomer(db, orgId, params),
  document_search: (db, orgId, params) => searchDocuments(db, orgId, params),
  report_generator: (db, orgId, params) => generateReport(db, orgId, params),
  proposal_generator: async (db, orgId, params) => ({
    draft: true,
    opportunityId: params.opportunityId,
    message: 'Proposal draft queued via approved tool',
  }),
  invoice_generator: async (db, orgId, params) => ({
    draft: true,
    proposalId: params.proposalId,
    message: 'Invoice generation queued via approved tool',
  }),
  campaign_generator: async (db, orgId, params) => ({
    draft: true,
    name: params.name || 'AI Campaign',
    message: 'Campaign draft queued via approved tool',
  }),
  geo_lead_finder: async () => ({ message: 'Geo scanner tool invoked — use scanner API' }),
  calendar: async (db, orgId, params) => ({ proposed: true, slot: params.slot || 'next_available' }),
  email: async () => ({ queued: true, channel: 'email' }),
  whatsapp: async () => ({ queued: true, channel: 'whatsapp' }),
  knowledge_base: async (db, orgId, params) => {
    const memories = await db.collection('agent_memory')
      .find({ orgId, layer: 'organization', key: { $regex: params.query || '', $options: 'i' } })
      .limit(5)
      .toArray()
    return { results: memories.map((m) => m.value) }
  },
}

/**
 * Invoke an approved tool with permission checks.
 */
export async function invokeAgentTool(db, {
  orgId,
  agentId,
  toolId,
  params = {},
  taskId = null,
}) {
  const tool = getTool(toolId)
  if (!tool) throw new Error(`Unknown tool: ${toolId}`)

  assertAgentToolAccess(agentId, toolId)

  const handler = TOOL_HANDLERS[toolId]
  if (!handler) throw new Error(`Tool handler not implemented: ${toolId}`)

  const startedAt = Date.now()
  const result = await handler(db, orgId, params)
  const durationMs = Date.now() - startedAt

  await db.collection('agent_tool_calls').insertOne({
    orgId,
    agentId,
    toolId,
    taskId,
    params,
    durationMs,
    success: true,
    createdAt: new Date().toISOString(),
  })

  return { toolId, result, durationMs }
}

export { TOOL_HANDLERS }
