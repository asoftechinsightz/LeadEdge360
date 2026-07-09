/**
 * Layered agent memory — tenant-isolated per org and agent.
 *
 * Layers: working, conversation, customer, organization, historical, preferences
 */

export const MEMORY_LAYERS = [
  'working',
  'conversation',
  'customer',
  'organization',
  'historical',
  'preferences',
]

export async function getMemory(db, orgId, agentId, { layer = null, key = null, customerId = null } = {}) {
  const filter = { orgId, agentId }
  if (layer) filter.layer = layer
  if (key) filter.key = key
  if (customerId) filter.customerId = customerId

  return db.collection('agent_memory')
    .find(filter, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray()
}

export async function setMemory(db, {
  orgId,
  agentId,
  layer,
  key,
  value,
  customerId = null,
  ttlHours = null,
}) {
  const now = new Date().toISOString()
  const doc = {
    orgId,
    agentId,
    layer,
    key,
    value,
    customerId,
    updatedAt: now,
    expiresAt: ttlHours ? new Date(Date.now() + ttlHours * 3600_000).toISOString() : null,
  }

  await db.collection('agent_memory').updateOne(
    { orgId, agentId, layer, key, customerId: customerId || null },
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
  return doc
}

export async function appendConversationMemory(db, { orgId, agentId, taskId, role, content }) {
  return setMemory(db, {
    orgId,
    agentId,
    layer: 'conversation',
    key: taskId || `conv_${Date.now()}`,
    value: { role, content, at: new Date().toISOString() },
    ttlHours: 72,
  })
}

export async function recordHistoricalDecision(db, {
  orgId,
  agentId,
  taskId,
  decision,
  confidence,
  explanation,
}) {
  return setMemory(db, {
    orgId,
    agentId,
    layer: 'historical',
    key: taskId,
    value: { decision, confidence, explanation, at: new Date().toISOString() },
  })
}

export async function getCustomerContext(db, orgId, agentId, customerId) {
  const [customer, prefs] = await Promise.all([
    getMemory(db, orgId, agentId, { layer: 'customer', customerId }),
    getMemory(db, orgId, agentId, { layer: 'preferences', customerId }),
  ])
  return { customer, preferences: prefs }
}

export async function getWorkingMemory(db, orgId, agentId, taskId) {
  const items = await getMemory(db, orgId, agentId, { layer: 'working' })
  return items.filter((m) => !taskId || m.key === taskId || m.value?.taskId === taskId)
}

export async function setWorkingMemory(db, orgId, agentId, taskId, value) {
  return setMemory(db, {
    orgId,
    agentId,
    layer: 'working',
    key: taskId,
    value,
    ttlHours: 24,
  })
}
