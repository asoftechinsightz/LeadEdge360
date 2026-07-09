import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { encryptCredentials, decryptCredentials } from './crypto.js'

const COLLECTION = 'org_integrations'

export async function ensureIntegrationIndexes(db) {
  await db.collection(COLLECTION).createIndex(
    { orgId: 1, integrationId: 1 },
    { unique: true, name: 'org_integrations_org_integration' },
  )
  await db.collection(COLLECTION).createIndex(
    { orgId: 1, status: 1 },
    { name: 'org_integrations_org_status' },
  )
}

export async function getOrgIntegration(db, orgId, integrationId) {
  return db.collection(COLLECTION).findOne({ orgId, integrationId }, { projection: { _id: 0 } })
}

export async function listOrgIntegrations(db, orgId) {
  return db.collection(COLLECTION).find({ orgId }, { projection: { _id: 0, encryptedCredentials: 0 } }).toArray()
}

export async function getDecryptedCredentials(record) {
  if (!record?.encryptedCredentials) return null
  return decryptCredentials(record.encryptedCredentials)
}

export async function upsertOrgIntegration(db, orgId, integrationId, patch) {
  const now = new Date().toISOString()
  const existing = await getOrgIntegration(db, orgId, integrationId)
  const id = existing?.id || randomUUID()

  const set = { ...patch, updatedAt: now }
  if (patch.credentials) {
    set.encryptedCredentials = encryptCredentials(patch.credentials)
    delete set.credentials
  }

  await db.collection(COLLECTION).updateOne(
    { orgId, integrationId },
    {
      $set: set,
      $setOnInsert: { id, orgId, integrationId, createdAt: now },
    },
    { upsert: true },
  )
  return getOrgIntegration(db, orgId, integrationId)
}

export async function clearIntegrationCredentials(db, orgId, integrationId) {
  const now = new Date().toISOString()
  await db.collection(COLLECTION).updateOne(
    { orgId, integrationId },
    {
      $set: {
        status: 'disconnected',
        updatedAt: now,
        disconnectedAt: now,
      },
      $unset: {
        encryptedCredentials: '',
        oauthState: '',
      },
    },
  )
}

export async function recordSyncJob(db, job) {
  const id = job.id || randomUUID()
  const doc = { id, ...job, createdAt: job.createdAt || new Date().toISOString() }
  await db.collection('integration_sync_jobs').insertOne(doc)
  return doc
}

export async function updateHealth(db, orgId, integrationId, healthPatch) {
  const now = new Date().toISOString()
  await db.collection(COLLECTION).updateOne(
    { orgId, integrationId },
    { $set: { health: healthPatch, 'health.lastCheckAt': now, updatedAt: now } },
  )
}
