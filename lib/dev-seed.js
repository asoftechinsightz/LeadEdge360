import { v4 as uuid } from 'uuid'
import { hashPassword } from './password'
import { DEMO_ORG_ID } from './tenant'

export const DEV_ADMIN_EMAIL = 'admin@asoftechinsightz.com'
export const DEV_ADMIN_PASSWORD = 'ChangeMe@2025'

let seeded = false

/** Ensures a local dev admin exists in MongoDB (development only). */
export async function ensureDevAdmin(db) {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SEED !== 'true') return
  if (seeded) return

  const users = db.collection('users')
  const existing = await users.findOne({ email: DEV_ADMIN_EMAIL })

  const orgs = db.collection('orgs')
  const org = await orgs.findOne({ id: DEMO_ORG_ID })
  if (!org) {
    await orgs.insertOne({
      id: DEMO_ORG_ID,
      name: 'AsoftechInsightz Demo',
      ownerEmail: DEV_ADMIN_EMAIL,
      plan: 'growth',
      createdAt: new Date().toISOString(),
    })
  }

  const passwordHash = await hashPassword(DEV_ADMIN_PASSWORD)
  const userDoc = {
    id: existing?.id || uuid(),
    orgId: DEMO_ORG_ID,
    email: DEV_ADMIN_EMAIL,
    fullName: 'Anoop Kumar',
    name: 'Anoop Kumar',
    passwordHash,
    role: 'admin',
    status: 'active',
    businessSuiteEnabled: true,
    products: ['leadedge360', 'retailedge360'],
    activeProduct: 'leadedge360',
    emailVerified: true,
    phoneVerified: true,
    phone: '+919999999999',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (existing) {
    await users.updateOne({ email: DEV_ADMIN_EMAIL }, { $set: userDoc })
  } else {
    await users.insertOne(userDoc)
  }

  seeded = true
}
