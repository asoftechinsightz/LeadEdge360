import { randomUUID, createHash } from 'crypto'
import { getDb } from '@/lib/mongo'
import { signAccessToken, verifyAccessToken } from '@/lib/jwt'
import { hashPassword, verifyPassword } from '@/lib/password'

function legacyHashPassword(password) {
  return createHash('sha256').update(`${password}:portal`).digest('hex')
}

async function verifyPortalPassword(password, storedHash) {
  if (!storedHash) return false
  if (storedHash.startsWith('$2')) return verifyPassword(password, storedHash)
  return storedHash === legacyHashPassword(password)
}

export async function setupPortalAccess(orgId, customerId, { email, password }) {
  if (!password) throw new Error('PORTAL_PASSWORD_REQUIRED')
  const db = await getDb()
  await db.collection('portal_users').updateOne(
    { orgId, customerId },
    {
      $set: {
        orgId,
        customerId,
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: { createdAt: new Date().toISOString() },
    },
    { upsert: true }
  )
  return { email }
}

export async function portalLogin(email, password) {
  const db = await getDb()
  const user = await db.collection('portal_users').findOne({ email: email.toLowerCase() })
  if (!user || !(await verifyPortalPassword(password, user.passwordHash))) {
    throw new Error('INVALID_CREDENTIALS')
  }

  if (!user.passwordHash?.startsWith('$2')) {
    await db.collection('portal_users').updateOne(
      { _id: user._id },
      { $set: { passwordHash: await hashPassword(password), updatedAt: new Date().toISOString() } }
    )
  }

  const customer = await db.collection('customers').findOne({ orgId: user.orgId, id: user.customerId })
  if (!customer) throw new Error('Customer not found')

  const token = signAccessToken({
    userId: user.customerId,
    tenantId: user.orgId,
    role: 'portal_customer',
    perms: ['portal'],
  })

  return {
    success: true,
    accessToken: token,
    customer: { id: customer.id, name: customer.name, email: customer.email, company: customer.company },
  }
}

export async function portalResetPassword(email, newPassword) {
  const db = await getDb()
  const user = await db.collection('portal_users').findOne({ email: email.toLowerCase() })
  if (!user) throw new Error('User not found')
  await db.collection('portal_users').updateOne(
    { _id: user._id },
    { $set: { passwordHash: await hashPassword(newPassword), updatedAt: new Date().toISOString() } }
  )
  return { success: true }
}

export function resolvePortalSession(request) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) throw new Error('UNAUTHORIZED')
  const payload = verifyAccessToken(auth.slice(7))
  if (!payload?.sub || payload.role !== 'portal_customer') throw new Error('UNAUTHORIZED')
  return { orgId: payload.tenantId, customerId: payload.sub }
}

export async function getPortalProfile(orgId, customerId) {
  const db = await getDb()
  const customer = await db.collection('customers').findOne({ orgId, id: customerId }, { projection: { _id: 0 } })
  if (!customer) throw new Error('Customer not found')
  return { success: true, profile: customer }
}

export async function updatePortalProfile(orgId, customerId, payload) {
  const db = await getDb()
  const allowed = ['name', 'phone']
  const update = { updatedAt: new Date().toISOString() }
  for (const k of allowed) {
    if (payload[k] !== undefined) update[k] = payload[k]
  }
  await db.collection('customers').updateOne({ orgId, id: customerId }, { $set: update })
  const customer = await db.collection('customers').findOne({ orgId, id: customerId }, { projection: { _id: 0 } })
  return { success: true, profile: customer }
}

export async function getPortalSubscriptions(orgId, customerId) {
  const db = await getDb()
  const items = await db.collection('customer_subscriptions')
    .find({ orgId, customerId }, { projection: { _id: 0 } }).toArray()
  return { success: true, items }
}

export async function getPortalInvoices(orgId, customerId) {
  const db = await getDb()
  const customer = await db.collection('customers').findOne({ orgId, id: customerId })
  const items = await db.collection('invoices').find({
    orgId,
    $or: [{ customerId }, { clientName: customer?.name }],
  }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(50).toArray()
  return { success: true, items }
}

export async function getPortalPayments(orgId, customerId) {
  const db = await getDb()
  const items = await db.collection('payments')
    .find({ orgId, customerId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(50).toArray()
  return { success: true, items }
}

export async function createSupportTicket(orgId, customerId, { subject, body }) {
  const db = await getDb()
  const ticket = {
    id: randomUUID(),
    orgId,
    customerId,
    subject,
    body,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  }
  await db.collection('support_tickets').insertOne(ticket)
  await db.collection('customer_activities').insertOne({
    id: randomUUID(),
    orgId,
    customerId,
    type: 'support',
    title: 'Support ticket created',
    detail: subject,
    createdAt: new Date().toISOString(),
  })
  return { success: true, ticket }
}

export async function getPortalNotifications(orgId, customerId) {
  const db = await getDb()
  const items = await db.collection('customer_activities')
    .find({ orgId, customerId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(20).toArray()
  return { success: true, items }
}
