#!/usr/bin/env node
/**
 * Verify Razorpay configuration (platform env or tenant integration).
 * Usage: node scripts/ops/verify-razorpay-env.mjs [orgId]
 */
import { loadEnvForScripts } from '../../lib/mongo-connect.js'
import { getRazorpayCredentialsForOrg } from '../../lib/integrations/razorpay-tenant.js'

loadEnvForScripts()

const orgId = process.argv[2] || process.env.INTERNAL_PRODUCTION_ORG_ID || 'asoftechinsightz'

async function main() {
  const creds = await getRazorpayCredentialsForOrg(orgId)
  if (!creds) {
    console.error('FAIL: No Razorpay credentials (platform env or tenant integration)')
    console.error('  Platform: set NEXT_PUBLIC_RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env')
    console.error('  Tenant: connect Razorpay in Settings → Integrations')
    process.exit(1)
  }

  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64')
  const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
    headers: { Authorization: `Basic ${auth}` },
  })

  const mode = creds.keyId.startsWith('rzp_live_') ? 'LIVE' : creds.keyId.startsWith('rzp_test_') ? 'TEST' : 'UNKNOWN'
  console.log(`Source: ${creds.source}`)
  console.log(`Key ID: ${creds.keyId.slice(0, 12)}… (${mode})`)
  console.log(`Webhook secret: ${creds.webhookSecret ? 'configured' : 'missing'}`)
  console.log(`API probe: HTTP ${res.status}`)

  if (res.status === 401) {
    console.error('FAIL: Invalid Razorpay credentials')
    process.exit(1)
  }

  console.log('OK: Razorpay credentials valid')
  if (mode === 'TEST') {
    console.warn('WARN: Using test keys — switch to rzp_live_* before customer payments')
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
