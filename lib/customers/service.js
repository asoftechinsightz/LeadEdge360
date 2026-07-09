import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'

const ALLOWED_UPDATE = [
  'name', 'company', 'email', 'phone', 'status', 'tags', 'ownerId',
  'parentCustomerId', 'contacts', 'leadId', 'opportunityId', 'territory',
]

export async function logCustomerActivity(orgId, customerId, type, title, detail = '') {
  const db = await getDb()
  await db.collection('customer_activities').insertOne({
    id: randomUUID(),
    orgId,
    customerId,
    type,
    title,
    detail,
    createdAt: new Date().toISOString(),
  })
}

export async function createCustomer(orgId, payload = {}) {
  const db = await getDb()
  if (payload.email) {
    const dup = await db.collection('customers').findOne({ orgId, email: payload.email })
    if (dup) throw new Error('Customer with this email already exists')
  }

  const customer = {
    id: randomUUID(),
    orgId,
    name: payload.name || 'Unnamed Customer',
    company: payload.company || '',
    email: payload.email || '',
    phone: payload.phone || '',
    status: payload.status || 'active',
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    ownerId: payload.ownerId || null,
    parentCustomerId: payload.parentCustomerId || null,
    contacts: Array.isArray(payload.contacts) ? payload.contacts : [],
    documents: [],
    leadId: payload.leadId || null,
    opportunityId: payload.opportunityId || null,
    territory: payload.territory || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('customers').insertOne(customer)
  await logCustomerActivity(orgId, customer.id, 'created', 'Customer created', customer.name)
  return { success: true, customer }
}

export async function listCustomers(orgId, { page = 1, limit = 20, q = '', status = null } = {}) {
  const db = await getDb()
  page = Math.max(parseInt(page, 10) || 1, 1)
  limit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
  const filter = { orgId }
  if (status) filter.status = status
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ]
  }

  const [items, total] = await Promise.all([
    db.collection('customers').find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection('customers').countDocuments(filter),
  ])

  return { success: true, page, limit, total, pages: Math.ceil(total / limit), items }
}

export async function getCustomer(orgId, customerId) {
  const db = await getDb()
  const customer = await db.collection('customers').findOne({ orgId, id: customerId }, { projection: { _id: 0 } })
  if (!customer) return null

  const children = await db.collection('customers')
    .find({ orgId, parentCustomerId: customerId }, { projection: { _id: 0, id: 1, name: 1, company: 1, status: 1 } })
    .toArray()

  const activities = await db.collection('customer_activities')
    .find({ orgId, customerId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(50).toArray()

  const subscriptions = await db.collection('customer_subscriptions')
    .find({ orgId, customerId }, { projection: { _id: 0 } }).toArray()

  return { ...customer, children, activities, subscriptions }
}

export async function updateCustomer(orgId, customerId, payload = {}) {
  const db = await getDb()
  const update = { updatedAt: new Date().toISOString() }
  for (const key of ALLOWED_UPDATE) {
    if (payload[key] !== undefined) update[key] = payload[key]
  }

  const result = await db.collection('customers').updateOne({ orgId, id: customerId }, { $set: update })
  if (!result.matchedCount) throw new Error('Customer not found')

  if (payload.note) {
    await db.collection('customer_notes').insertOne({
      id: randomUUID(),
      orgId,
      customerId,
      body: payload.note,
      createdAt: new Date().toISOString(),
    })
    await logCustomerActivity(orgId, customerId, 'note', 'Note added', payload.note.slice(0, 120))
  }

  await logCustomerActivity(orgId, customerId, 'updated', 'Customer updated')
  const customer = await db.collection('customers').findOne({ orgId, id: customerId }, { projection: { _id: 0 } })
  return { success: true, customer }
}

export async function deleteCustomer(orgId, customerId) {
  const db = await getDb()
  const activeSubs = await db.collection('customer_subscriptions').countDocuments({
    orgId, customerId, status: { $in: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD', 'PAST_DUE'] },
  })
  if (activeSubs > 0) throw new Error('Cannot delete customer with active subscriptions')

  const result = await db.collection('customers').deleteOne({ orgId, id: customerId })
  if (result.deletedCount) {
    await db.collection('customer_activities').deleteMany({ orgId, customerId })
    await db.collection('customer_notes').deleteMany({ orgId, customerId })
  }
  return { success: true, deleted: result.deletedCount > 0 }
}

export async function addCustomerNote(orgId, customerId, body) {
  const db = await getDb()
  const customer = await db.collection('customers').findOne({ orgId, id: customerId })
  if (!customer) throw new Error('Customer not found')

  const note = {
    id: randomUUID(),
    orgId,
    customerId,
    body,
    createdAt: new Date().toISOString(),
  }
  await db.collection('customer_notes').insertOne(note)
  await logCustomerActivity(orgId, customerId, 'note', 'Note added', body.slice(0, 120))
  return { success: true, note }
}

export async function getCustomerDashboard(orgId) {
  const db = await getDb()
  const [active, trial, churned, expiring, byPlan] = await Promise.all([
    db.collection('customers').countDocuments({ orgId, status: 'active' }),
    db.collection('customer_subscriptions').countDocuments({ orgId, status: 'TRIAL' }),
    db.collection('customers').countDocuments({ orgId, status: 'churned' }),
    db.collection('customer_subscriptions').countDocuments({
      orgId,
      status: 'ACTIVE',
      renewalDate: { $lte: new Date(Date.now() + 30 * 86400000).toISOString() },
    }),
    db.collection('customer_subscriptions').aggregate([
      { $match: { orgId, status: { $in: ['ACTIVE', 'TRIAL'] } } },
      { $group: { _id: '$planCode', count: { $sum: 1 } } },
    ]).toArray(),
  ])

  const revenueByCustomer = await db.collection('revenue').aggregate([
    { $match: { orgId, status: 'PAID' } },
    { $group: { _id: '$clientName', amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } },
    { $limit: 10 },
  ]).toArray()

  return {
    success: true,
    activeCustomers: active,
    trialCustomers: trial,
    expiringCustomers: expiring,
    churnedCustomers: churned,
    subscriptionsByPlan: byPlan.map((r) => ({ plan: r._id, count: r.count })),
    revenueByCustomer: revenueByCustomer.map((r) => ({ customer: r._id, amount: r.amount })),
  }
}

export async function exportCustomersCsv(orgId) {
  const db = await getDb()
  const rows = await db.collection('customers').find({ orgId }, { projection: { _id: 0 } }).toArray()
  const header = 'id,name,company,email,phone,status,tags,createdAt'
  const lines = rows.map((r) => [
    r.id, `"${(r.name || '').replace(/"/g, '""')}"`, `"${(r.company || '').replace(/"/g, '""')}"`,
    r.email, r.phone, r.status, (r.tags || []).join('|'), r.createdAt,
  ].join(','))
  return { success: true, csv: [header, ...lines].join('\n'), rowCount: rows.length }
}

export async function seedDemoCustomersIfEmpty(db) {
  const count = await db.collection('customers').countDocuments({ orgId: DEMO_ORG_ID })
  if (count > 0) return

  const parentId = randomUUID()
  await db.collection('customers').insertOne({
    id: parentId,
    orgId: DEMO_ORG_ID,
    name: 'Trinity Auto Group',
    company: 'Trinity Auto',
    email: 'billing@trinityauto.in',
    phone: '+919812345677',
    status: 'active',
    tags: ['enterprise', 'automotive'],
    territory: 'Bengaluru',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await db.collection('customers').insertOne({
    id: randomUUID(),
    orgId: DEMO_ORG_ID,
    name: 'Sahil Khan',
    company: 'Trinity Auto — Bengaluru',
    email: 'sahil@trinityauto.in',
    phone: '+919812345677',
    status: 'active',
    parentCustomerId: parentId,
    tags: ['branch'],
    territory: 'Bengaluru',
    leadId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await logCustomerActivity(DEMO_ORG_ID, parentId, 'created', 'Demo customer seeded')
}
