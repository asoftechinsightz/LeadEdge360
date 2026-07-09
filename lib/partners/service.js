import { randomUUID } from 'crypto'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongo'
import { DEMO_ORG_ID } from '@/lib/tenant'

export const PARTNER_PLANS = ['PRO', 'ENTERPRISE']

export async function createPartner(orgId, payload = {}) {
  const db = await getDb()
  const existing = await db.collection('partners').findOne({ orgId, email: payload.email })
  if (existing) throw new Error('Partner email already registered')

  const partner = {
    id: randomUUID(),
    orgId,
    partnerId: randomUUID(),
    name: payload.name || '',
    email: payload.email || '',
    company: payload.company || '',
    commissionPercent: payload.commissionPercent ?? 10,
    status: payload.status || 'PENDING',
    referralCode: payload.referralCode || `REF-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('partners').insertOne(partner)
  return { success: true, partner }
}

export async function listPartners(orgId, { status = null } = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (status) filter.status = status
  const items = await db.collection('partners').find(filter, { projection: { _id: 0 } }).toArray()
  return { success: true, items }
}

export async function getPartner(orgId, partnerId) {
  const db = await getDb()
  return db.collection('partners').findOne({ orgId, id: partnerId }, { projection: { _id: 0 } })
}

export async function approvePartner(orgId, partnerId) {
  const db = await getDb()
  const result = await db.collection('partners').updateOne(
    { orgId, id: partnerId },
    { $set: { status: 'ACTIVE', approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
  )
  if (!result.matchedCount) throw new Error('Partner not found')
  return { success: true, status: 'ACTIVE' }
}

export async function registerReferral(orgId, { partnerId, leadId, customerId }) {
  const db = await getDb()
  const partner = await db.collection('partners').findOne({ orgId, id: partnerId, status: 'ACTIVE' })
  if (!partner) throw new Error('Partner not found or not active')

  const dup = await db.collection('partner_referrals').findOne({
    orgId,
    $or: [
      ...(leadId ? [{ leadId }] : []),
      ...(customerId ? [{ customerId }] : []),
    ],
  })
  if (dup) throw new Error('Referral already registered')

  const referral = {
    id: randomUUID(),
    orgId,
    partnerId: partner.partnerId,
    partnerRecordId: partner.id,
    leadId: leadId || null,
    customerId: customerId || null,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }
  await db.collection('partner_referrals').insertOne(referral)
  return { success: true, referral }
}

export async function recordPartnerCommission(orgId, { partnerId, invoiceId, invoiceNumber, revenueAmount }) {
  const db = await getDb()
  const partner = await db.collection('partners').findOne({ orgId, partnerId, status: 'ACTIVE' })
  if (!partner) return null

  const existing = await db.collection('partner_commissions').findOne({ orgId, invoiceId, partnerId })
  if (existing) return { duplicate: true, commission: existing }

  const commissionAmount = Number(((revenueAmount * partner.commissionPercent) / 100).toFixed(2))
  const commission = {
    id: randomUUID(),
    orgId,
    partnerId: partner.partnerId,
    partnerRecordId: partner.id,
    invoiceId,
    invoiceNumber,
    revenueAmount,
    commissionPercent: partner.commissionPercent,
    commissionAmount,
    status: 'PENDING',
    createdAt: new Date(),
  }
  await db.collection('partner_commissions').insertOne(commission)
  return { success: true, commission }
}

export async function listCommissions(orgId, { partnerId = null, status = null } = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (partnerId) filter.partnerId = partnerId
  if (status) filter.status = status
  const items = await db.collection('partner_commissions').find(filter, { projection: { _id: 0 } }).toArray()
  return { success: true, items }
}

export async function processPayout(orgId, commissionId) {
  const db = await getDb()
  const commission = await db.collection('partner_commissions').findOne({
    _id: new ObjectId(commissionId),
    orgId,
  })
  if (!commission) throw new Error('COMMISSION_NOT_FOUND')
  if (commission.status === 'PAID') return { success: true, duplicate: true }

  const payout = {
    orgId,
    partnerId: commission.partnerId,
    commissionId: String(commission._id),
    amount: commission.commissionAmount,
    status: 'PAID',
    paidAt: new Date(),
    createdAt: new Date(),
  }
  const result = await db.collection('partner_payouts').insertOne(payout)
  await db.collection('partner_commissions').updateOne(
    { _id: commission._id },
    { $set: { status: 'PAID', paidAt: new Date() } }
  )
  return { success: true, payoutId: String(result.insertedId) }
}

export async function getPartnerDashboard(orgId) {
  const db = await getDb()
  const match = { orgId }

  const [totalAgg, pendingAgg, paidAgg, partnerCount, activeCount] = await Promise.all([
    db.collection('partner_commissions').aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]).toArray(),
    db.collection('partner_commissions').aggregate([{ $match: { ...match, status: 'PENDING' } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]).toArray(),
    db.collection('partner_commissions').aggregate([{ $match: { ...match, status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]).toArray(),
    db.collection('partners').countDocuments({ orgId }),
    db.collection('partners').countDocuments({ orgId, status: 'ACTIVE' }),
  ])

  const monthly = await db.collection('partner_commissions').aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, amount: { $sum: '$commissionAmount' } } },
    { $sort: { _id: -1 } },
    { $limit: 12 },
  ]).toArray()

  return {
    success: true,
    totalCommission: totalAgg[0]?.total || 0,
    pendingCommission: pendingAgg[0]?.total || 0,
    paidCommission: paidAgg[0]?.total || 0,
    partnerCount,
    activePartnerCount: activeCount,
    monthlyPayoutReport: monthly.map((r) => ({ month: r._id, amount: r.amount })),
  }
}

export async function listReferrals(orgId, { partnerId = null } = {}) {
  const db = await getDb()
  const filter = { orgId }
  if (partnerId) filter.partnerId = partnerId
  const items = await db.collection('partner_referrals').find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()
  return { success: true, items }
}

export async function exportPartnersCsv(orgId) {
  const db = await getDb()
  const rows = await db.collection('partners').find({ orgId }, { projection: { _id: 0 } }).toArray()
  const header = 'id,name,email,status,commissionPercent,referralCode'
  const lines = rows.map((r) => [r.id, r.name, r.email, r.status, r.commissionPercent, r.referralCode].join(','))
  return { success: true, csv: [header, ...lines].join('\n'), rowCount: rows.length }
}

export async function seedDemoPartnersIfEmpty(db) {
  const count = await db.collection('partners').countDocuments({ orgId: DEMO_ORG_ID })
  if (count > 0) return

  await db.collection('partners').insertOne({
    id: randomUUID(),
    orgId: DEMO_ORG_ID,
    partnerId: randomUUID(),
    name: 'Demo Partner',
    email: 'partner@demo.test',
    company: 'Demo Partners LLP',
    commissionPercent: 10,
    status: 'ACTIVE',
    referralCode: 'DEMO-REF-01',
    approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}
