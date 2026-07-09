#!/usr/bin/env node
/**
 * Set a user's password hash (bcryptjs, same as the app).
 *
 * Usage:
 *   ADMIN_EMAIL=admin@asoftechinsightz.com ADMIN_PASSWORD='secret' npm run db:set-password
 */
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { hashPassword } from '../lib/password.js'

loadEnvForScripts()

const email = process.env.ADMIN_EMAIL || process.argv[2]
const password = process.env.ADMIN_PASSWORD || process.argv[3]

if (!email || !password) {
  console.error('Usage: ADMIN_EMAIL=user@example.com ADMIN_PASSWORD=secret npm run db:set-password')
  process.exit(1)
}

const { mongoUrl, dbName } = getMongoConnectConfig()

async function main() {
  const passwordHash = await hashPassword(password)
  const client = new MongoClient(mongoUrl)
  await client.connect()
  const db = client.db(dbName)

  const result = await db.collection('users').updateOne(
    { email },
    {
      $set: {
        passwordHash,
        status: 'active',
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      },
    },
  )

  await client.close()

  if (result.matchedCount === 0) {
    console.error(`[set-admin-password] No user found with email: ${email}`)
    process.exit(1)
  }

  console.log(`[set-admin-password] Updated ${email} (status=active, password hash set)`)
}

main().catch((err) => {
  console.error('[set-admin-password] failed:', err.message)
  process.exit(1)
})
