import { randomUUID } from 'crypto'

const COLLECTION = 'territories'

export async function listTerritories(db, orgId) {
  const items = await db.collection(COLLECTION)
    .find({ orgId, active: { $ne: false } }, { projection: { _id: 0 } })
    .sort({ name: 1 })
    .toArray()
  return { items }
}

export async function createTerritory(db, orgId, userId, body) {
  const name = String(body.name || '').trim()
  if (!name) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'name is required'
    throw err
  }
  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    name,
    code: String(body.code || name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 24),
    region: String(body.region || '').trim(),
    manager: String(body.manager || '').trim(),
    active: true,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  }
  await db.collection(COLLECTION).insertOne(doc)
  return doc
}

export async function updateTerritory(db, orgId, userId, id, body) {
  const existing = await db.collection(COLLECTION).findOne({ orgId, id })
  if (!existing) {
    const err = new Error('NOT_FOUND')
    throw err
  }
  const update = { updatedAt: new Date().toISOString(), updatedBy: userId }
  if (body.name) update.name = String(body.name).trim()
  if (body.region !== undefined) update.region = String(body.region || '').trim()
  if (body.manager !== undefined) update.manager = String(body.manager || '').trim()
  if (body.active !== undefined) update.active = Boolean(body.active)
  await db.collection(COLLECTION).updateOne({ orgId, id }, { $set: update })
  return { ...existing, ...update }
}

export async function listTerritoriesWithStats(db, orgId, userId = 'system') {
  let { items } = await listTerritories(db, orgId)
  if (!items.length) {
    const defaults = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune']
    for (const name of defaults) {
      await createTerritory(db, orgId, userId, { name, region: 'India' })
    }
    items = (await listTerritories(db, orgId)).items
  }

  const enriched = []
  for (const t of items) {
    const filter = {
      orgId,
      territory: t.name,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    }
    const leadCount = await db.collection('leads').countDocuments(filter)
    const won = await db.collection('leads').countDocuments({ ...filter, status: 'Won' })
    enriched.push({
      ...t,
      leadCount,
      wonRevenue: won * 50000,
      agents: Math.max(1, Math.ceil(leadCount / 10)),
      conversion: leadCount ? Math.round((won / leadCount) * 100) : 0,
      status: t.active !== false ? 'active' : 'inactive',
    })
  }
  return enriched
}
