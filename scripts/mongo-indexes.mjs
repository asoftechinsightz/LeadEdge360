/**
 * Sprint 0 — MongoDB index migration (non-breaking).
 * Usage: node scripts/mongo-indexes.mjs
 *        node scripts/mongo-indexes.mjs --dry-run
 */
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig, maskMongoUrl } from '../lib/mongo-connect.js'

const dryRun = process.argv.includes('--dry-run')

loadEnvForScripts()

const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

function keysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function indexExistsForKey(indexes, key) {
  return indexes.some((idx) => idx.name !== '_id_' && keysEqual(idx.key, key))
}

function isIndexConflictError(err) {
  const msg = String(err?.message || '')
  return err?.code === 85 || err?.code === 86 || err?.codeName === 'IndexOptionsConflict'
    || /already exists with a different name/i.test(msg)
    || /Index already exists/i.test(msg)
}

/** @type {Array<{ collection: string, key: Record<string, number>, options?: object }>} */
const INDEXES = [
  { collection: 'users', key: { email: 1 }, options: { unique: true, name: 'users_email_unique' } },
  { collection: 'users', key: { orgId: 1 }, options: { name: 'users_orgId' } },
  { collection: 'leads', key: { orgId: 1, id: 1 }, options: { name: 'leads_orgId_id' } },
  { collection: 'leads', key: { orgId: 1, createdAt: -1 }, options: { name: 'leads_orgId_createdAt' } },
  { collection: 'leads', key: { orgId: 1, status: 1 }, options: { name: 'leads_orgId_status' } },
  { collection: 'leads', key: { orgId: 1, deletedAt: 1 }, options: { name: 'leads_orgId_deletedAt', sparse: true } },
  { collection: 'leads', key: { orgId: 1, territory: 1 }, options: { name: 'leads_orgId_territory' } },
  { collection: 'territories', key: { orgId: 1, id: 1 }, options: { name: 'territories_orgId_id' } },
  { collection: 'territories', key: { orgId: 1, name: 1 }, options: { name: 'territories_orgId_name' } },
  { collection: 'territories', key: { orgId: 1, active: 1, name: 1 }, options: { name: 'territories_org_active_name' } },
  { collection: 'lead_assignments', key: { orgId: 1, leadId: 1, createdAt: -1 }, options: { name: 'lead_assignments_org_lead_createdAt' } },
  { collection: 'audit_logs', key: { orgId: 1, entity: 1, entityId: 1 }, options: { name: 'audit_logs_org_entity' } },
  { collection: 'leads', key: { orgId: 1, name: 1 }, options: { name: 'leads_orgId_name' } },
  { collection: 'leads', key: { orgId: 1, email: 1 }, options: { name: 'leads_orgId_email', sparse: true } },
  { collection: 'leads', key: { orgId: 1, phone: 1 }, options: { name: 'leads_orgId_phone' } },
  { collection: 'leads', key: { orgId: 1, company: 1 }, options: { name: 'leads_orgId_company', sparse: true } },
  { collection: 'opportunities', key: { orgId: 1, name: 1 }, options: { name: 'opportunities_orgId_name', sparse: true } },
  { collection: 'proposals', key: { orgId: 1, clientName: 1 }, options: { name: 'proposals_orgId_clientName', sparse: true } },
  { collection: 'campaigns', key: { orgId: 1, name: 1 }, options: { name: 'campaigns_orgId_name' } },
  { collection: 'opportunities', key: { orgId: 1, id: 1 }, options: { name: 'opportunities_orgId_id' } },
  { collection: 'opportunities', key: { orgId: 1, stage: 1 }, options: { name: 'opportunities_orgId_stage' } },
  { collection: 'proposals', key: { orgId: 1, id: 1 }, options: { name: 'proposals_orgId_id' } },
  { collection: 'campaigns', key: { orgId: 1, createdAt: -1 }, options: { name: 'campaigns_orgId_createdAt' } },
  { collection: 'subscriptions', key: { orgId: 1, status: 1 }, options: { name: 'subscriptions_orgId_status' } },
  { collection: 'customers', key: { orgId: 1, id: 1 }, options: { name: 'customers_orgId_id' } },
  { collection: 'invoices', key: { orgId: 1, createdAt: -1 }, options: { name: 'invoices_orgId_createdAt' } },
  { collection: 'payments', key: { orgId: 1, orderId: 1 }, options: { name: 'payments_orgId_orderId' } },
  { collection: 'audit_logs', key: { orgId: 1, createdAt: -1 }, options: { name: 'audit_logs_orgId_createdAt' } },
  { collection: 'platform_events', key: { orgId: 1, createdAt: -1 }, options: { name: 'platform_events_org_createdAt' } },
  { collection: 'platform_events', key: { orgId: 1, type: 1, createdAt: -1 }, options: { name: 'platform_events_org_type_createdAt' } },
  { collection: 'org_activities', key: { orgId: 1, createdAt: -1, id: -1 }, options: { name: 'org_activities_org_createdAt_id' } },
  { collection: 'org_activities', key: { orgId: 1, sourceKey: 1 }, options: { unique: true, name: 'org_activities_org_sourceKey' } },
  { collection: 'org_activities', key: { orgId: 1, category: 1, createdAt: -1 }, options: { name: 'org_activities_org_category_createdAt' } },
  { collection: 'org_activities', key: { orgId: 1, actorType: 1, createdAt: -1 }, options: { name: 'org_activities_org_actor_createdAt' } },
  { collection: 'org_activities', key: { orgId: 1, userId: 1, createdAt: -1 }, options: { name: 'org_activities_org_user_createdAt', sparse: true } },
  { collection: 'org_activities', key: { orgId: 1, searchText: 1 }, options: { name: 'org_activities_org_searchText' } },
  { collection: 'org_notifications', key: { orgId: 1, createdAt: -1 }, options: { name: 'org_notifications_org_createdAt' } },
  { collection: 'org_notifications', key: { orgId: 1, sourceKey: 1 }, options: { unique: true, name: 'org_notifications_org_sourceKey' } },
  { collection: 'org_notifications', key: { orgId: 1, readAt: 1, createdAt: -1 }, options: { name: 'org_notifications_org_read_createdAt', sparse: true } },
  { collection: 'lead_timeline', key: { orgId: 1, createdAt: -1 }, options: { name: 'lead_timeline_org_createdAt' } },
  { collection: 'platform_events', key: { orgId: 1, correlationId: 1, createdAt: 1 }, options: { name: 'platform_events_org_correlation', sparse: true } },
  { collection: 'platform_events', key: { orgId: 1, versionedType: 1, createdAt: -1 }, options: { name: 'platform_events_org_versionedType', sparse: true } },
  { collection: 'dead_letter_events', key: { orgId: 1, status: 1, createdAt: -1 }, options: { name: 'dlq_org_status_createdAt' } },
  { collection: 'dead_letter_events', key: { orgId: 1, eventId: 1 }, options: { name: 'dlq_org_eventId', sparse: true } },
  { collection: 'event_processing_log', key: { orgId: 1, processor: 1, createdAt: -1 }, options: { name: 'event_proc_log_org_processor' } },
  { collection: 'event_processing_log', key: { orgId: 1, status: 1, createdAt: -1 }, options: { name: 'event_proc_log_org_status' } },
  { collection: 'event_replay_jobs', key: { orgId: 1, createdAt: -1 }, options: { name: 'event_replay_jobs_org_createdAt' } },
  { collection: 'event_analytics', key: { orgId: 1, type: 1, day: 1 }, options: { unique: true, name: 'event_analytics_org_type_day' } },
  { collection: 'ai_agent_memory', key: { orgId: 1, agentId: 1, createdAt: -1 }, options: { name: 'ai_memory_org_agent_createdAt' } },
  { collection: 'ai_agent_memory', key: { orgId: 1, eventId: 1, agentId: 1 }, options: { unique: true, name: 'ai_memory_org_event_agent', sparse: true } },
  { collection: 'event_search_index', key: { orgId: 1, eventId: 1 }, options: { unique: true, name: 'event_search_org_eventId' } },
  { collection: 'audit_logs', key: { orgId: 1, correlationId: 1, createdAt: 1 }, options: { name: 'audit_logs_org_correlation', sparse: true } },
  { collection: 'agent_tasks', key: { orgId: 1, status: 1, createdAt: -1 }, options: { name: 'agent_tasks_org_status_createdAt' } },
  { collection: 'agent_tasks', key: { orgId: 1, agentId: 1, createdAt: -1 }, options: { name: 'agent_tasks_org_agent_createdAt' } },
  { collection: 'agent_tasks', key: { orgId: 1, eventId: 1 }, options: { name: 'agent_tasks_org_eventId', sparse: true } },
  { collection: 'agent_tasks', key: { orgId: 1, correlationId: 1 }, options: { name: 'agent_tasks_org_correlation', sparse: true } },
  { collection: 'agent_memory', key: { orgId: 1, agentId: 1, layer: 1, key: 1 }, options: { name: 'agent_memory_org_agent_layer_key' } },
  { collection: 'agent_tool_calls', key: { orgId: 1, agentId: 1, createdAt: -1 }, options: { name: 'agent_tool_calls_org_agent_createdAt' } },
  { collection: 'agent_token_usage', key: { orgId: 1, agentId: 1, createdAt: -1 }, options: { name: 'agent_token_usage_org_agent_createdAt' } },
  { collection: 'agent_delegations', key: { orgId: 1, createdAt: -1 }, options: { name: 'agent_delegations_org_createdAt' } },
  { collection: 'org_approval_rules', key: { orgId: 1, priority: 1 }, options: { name: 'org_approval_rules_org_priority' } },
  { collection: 'org_webhook_config', key: { orgId: 1 }, options: { unique: true, name: 'org_webhook_config_orgId' } },
  { collection: 'org_integrations', key: { orgId: 1, integrationId: 1 }, options: { unique: true, name: 'org_integrations_org_integration' } },
  { collection: 'org_integrations', key: { orgId: 1, status: 1 }, options: { name: 'org_integrations_org_status' } },
  { collection: 'integration_audit_logs', key: { orgId: 1, integrationId: 1, createdAt: -1 }, options: { name: 'integration_audit_org_integration_created' } },
  { collection: 'integration_audit_logs', key: { orgId: 1, createdAt: -1 }, options: { name: 'integration_audit_org_created' } },
  { collection: 'integration_sync_jobs', key: { orgId: 1, integrationId: 1, createdAt: -1 }, options: { name: 'integration_sync_jobs_org_integration_created' } },
  { collection: 'integration_calendar_events', key: { orgId: 1, integrationId: 1, externalId: 1 }, options: { unique: true, name: 'integration_calendar_org_ext', sparse: true } },
  { collection: 'integration_sync_records', key: { orgId: 1, integrationId: 1, externalId: 1 }, options: { unique: true, name: 'integration_sync_org_ext', sparse: true } },
  { collection: 'integration_sync_records', key: { orgId: 1, integrationId: 1, syncedAt: -1 }, options: { name: 'integration_sync_org_synced', sparse: true } },
  { collection: 'webhook_deliveries', key: { orgId: 1, createdAt: -1 }, options: { name: 'webhook_deliveries_org_createdAt' } },
  { collection: 'executive_briefings', key: { orgId: 1, type: 1 }, options: { unique: true, name: 'executive_briefings_org_type' } },
  { collection: 'org_ai_settings', key: { orgId: 1 }, options: { unique: true, name: 'org_ai_settings_orgId' } },
  { collection: 'org_industry_profile', key: { orgId: 1 }, options: { unique: true, name: 'org_industry_profile_orgId' } },
  { collection: 'org_agent_packages', key: { orgId: 1, packageId: 1 }, options: { unique: true, name: 'org_agent_packages_org_package' } },
  { collection: 'dr_recovery_log', key: { orgId: 1, startedAt: -1 }, options: { name: 'dr_recovery_log_org_startedAt' } },
  { collection: 'scheduled_event_log', key: { orgId: 1, dedupeKey: 1 }, options: { unique: true, name: 'scheduled_event_log_org_dedupe' } },
  { collection: 'audit_logs', key: { orgId: 1, actorType: 1, createdAt: -1 }, options: { name: 'audit_logs_org_actor_createdAt', sparse: true } },
  { collection: 'auth_refresh_tokens', key: { tokenHash: 1 }, options: { unique: true, name: 'auth_refresh_tokenHash' } },
  { collection: 'auth_otps', key: { destination: 1, purpose: 1, consumedAt: 1 }, options: { name: 'auth_otps_lookup' } },
  { collection: 'webhook_events', key: { eventId: 1 }, options: { unique: true, sparse: true, name: 'webhook_events_eventId' } },
  { collection: 'lead_scores', key: { orgId: 1, score: -1 }, options: { name: 'lead_scores_orgId_score' } },
  { collection: 'campaign_executions', key: { orgId: 1, campaignId: 1 }, options: { name: 'campaign_executions_org_campaign' } },
  { collection: 'scanner_results', key: { orgId: 1, jobId: 1 }, options: { name: 'scanner_results_org_job' } },
  { collection: 'business_cards', key: { orgId: 1, id: 1 }, options: { name: 'business_cards_orgId_id' } },
  { collection: 'business_cards', key: { slug: 1 }, options: { unique: true, name: 'business_cards_slug_unique' } },
  { collection: 'business_cards', key: { orgId: 1, updatedAt: -1 }, options: { name: 'business_cards_orgId_updatedAt' } },
  { collection: 'qr_codes', key: { orgId: 1 }, options: { name: 'qr_codes_orgId' } },
  { collection: 'qr_codes', key: { orgId: 1, id: 1 }, options: { name: 'qr_codes_orgId_id' } },
  { collection: 'qr_codes', key: { orgId: 1, type: 1 }, options: { name: 'qr_codes_orgId_type' } },
  { collection: 'qr_codes', key: { orgId: 1, code: 1 }, options: { unique: true, name: 'qr_codes_orgId_code' } },
  { collection: 'qr_codes', key: { orgId: 1, createdAt: -1 }, options: { name: 'qr_codes_orgId_createdAt' } },
  { collection: 'qr_codes', key: { code: 1 }, options: { unique: true, name: 'qr_codes_code_unique' } },
  { collection: 'qr_codes', key: { orgId: 1, updatedAt: -1 }, options: { name: 'qr_codes_orgId_updatedAt' } },
  { collection: 'qr_events', key: { orgId: 1, qrCodeId: 1, createdAt: -1 }, options: { name: 'qr_events_org_qr_createdAt' } },
  { collection: 'qr_events', key: { orgId: 1, eventType: 1, createdAt: -1 }, options: { name: 'qr_events_org_type_createdAt' } },
  { collection: 'qr_conversions', key: { orgId: 1, qrCodeId: 1, createdAt: -1 }, options: { name: 'qr_conversions_org_qr_createdAt' } },
  { collection: 'qr_conversions', key: { orgId: 1, createdAt: -1 }, options: { name: 'qr_conversions_orgId_createdAt' } },
  { collection: 'review_campaigns', key: { orgId: 1, id: 1 }, options: { name: 'review_campaigns_orgId_id' } },
  { collection: 'review_campaigns', key: { orgId: 1, createdAt: -1 }, options: { name: 'review_campaigns_orgId_createdAt' } },
  { collection: 'review_campaigns', key: { orgId: 1, status: 1 }, options: { name: 'review_campaigns_orgId_status' } },
  { collection: 'review_requests', key: { orgId: 1, id: 1 }, options: { name: 'review_requests_orgId_id' } },
  { collection: 'review_requests', key: { orgId: 1, campaignId: 1, createdAt: -1 }, options: { name: 'review_requests_org_campaign_createdAt' } },
  { collection: 'review_requests', key: { token: 1 }, options: { unique: true, name: 'review_requests_token_unique' } },
  { collection: 'whatsapp_threads', key: { orgId: 1, id: 1 }, options: { name: 'whatsapp_threads_orgId_id' } },
  { collection: 'whatsapp_threads', key: { orgId: 1, contactPhone: 1 }, options: { unique: true, name: 'whatsapp_threads_org_phone' } },
  { collection: 'whatsapp_threads', key: { orgId: 1, lastMessageAt: -1 }, options: { name: 'whatsapp_threads_org_lastMessage' } },
  { collection: 'whatsapp_messages', key: { orgId: 1, threadId: 1, createdAt: 1 }, options: { name: 'whatsapp_messages_org_thread_created' } },
  { collection: 'retail_stores', key: { orgId: 1, id: 1 }, options: { name: 'retail_stores_orgId_id' } },
  { collection: 'retail_stores', key: { orgId: 1, code: 1 }, options: { unique: true, name: 'retail_stores_org_code' } },
  { collection: 'retail_products', key: { orgId: 1, id: 1 }, options: { name: 'retail_products_orgId_id' } },
  { collection: 'retail_products', key: { orgId: 1, sku: 1 }, options: { unique: true, name: 'retail_products_org_sku' } },
  { collection: 'retail_products', key: { orgId: 1, category: 1 }, options: { name: 'retail_products_org_category' } },
  { collection: 'retail_products', key: { orgId: 1, risk: 1 }, options: { name: 'retail_products_org_risk' } },
  { collection: 'retail_inventory', key: { orgId: 1, id: 1 }, options: { name: 'retail_inventory_orgId_id' } },
  { collection: 'retail_inventory', key: { orgId: 1, storeId: 1, productId: 1 }, options: { unique: true, name: 'retail_inventory_org_store_product' } },
  { collection: 'retail_inventory', key: { orgId: 1, storeId: 1 }, options: { name: 'retail_inventory_org_store' } },
  { collection: 'retail_inventory', key: { orgId: 1, expiryDate: 1 }, options: { name: 'retail_inventory_org_expiry' } },
  { collection: 'product_batches', key: { orgId: 1, id: 1 }, options: { name: 'product_batches_orgId_id' } },
  { collection: 'product_batches', key: { orgId: 1, batchNumber: 1 }, options: { unique: true, name: 'product_batches_org_batch' } },
  { collection: 'product_batches', key: { orgId: 1, productId: 1, expiryDate: 1 }, options: { name: 'product_batches_org_product_expiry' } },
  { collection: 'product_batches', key: { orgId: 1, expiryDate: 1 }, options: { name: 'product_batches_org_expiry' } },
  { collection: 'product_batches', key: { orgId: 1, batchStatus: 1 }, options: { name: 'product_batches_org_status' } },
  { collection: 'product_batches', key: { orgId: 1, warehouseId: 1 }, options: { name: 'product_batches_org_warehouse' } },
  { collection: 'product_batches', key: { orgId: 1, supplier: 1 }, options: { name: 'product_batches_org_supplier' } },
  { collection: 'product_batches', key: { orgId: 1, category: 1 }, options: { name: 'product_batches_org_category' } },
  { collection: 'product_batches', key: { orgId: 1, barcode: 1 }, options: { name: 'product_batches_org_barcode', sparse: true } },
  { collection: 'expiry_alerts', key: { orgId: 1, id: 1 }, options: { name: 'expiry_alerts_orgId_id' } },
  { collection: 'expiry_alerts', key: { orgId: 1, level: 1, acknowledged: 1 }, options: { name: 'expiry_alerts_org_level_ack' } },
  { collection: 'expiry_alerts', key: { orgId: 1, batchId: 1 }, options: { name: 'expiry_alerts_org_batch' } },
  { collection: 'expiry_alerts', key: { orgId: 1, createdAt: -1 }, options: { name: 'expiry_alerts_org_created' } },
  { collection: 'expiry_returns', key: { orgId: 1, id: 1 }, options: { name: 'expiry_returns_orgId_id' } },
  { collection: 'expiry_returns', key: { orgId: 1, returnNumber: 1 }, options: { unique: true, name: 'expiry_returns_org_number' } },
  { collection: 'expiry_returns', key: { orgId: 1, status: 1 }, options: { name: 'expiry_returns_org_status' } },
  { collection: 'inventory_disposals', key: { orgId: 1, id: 1 }, options: { name: 'inventory_disposals_orgId_id' } },
  { collection: 'inventory_disposals', key: { orgId: 1, disposalNumber: 1 }, options: { unique: true, name: 'inventory_disposals_org_number' } },
  { collection: 'expiry_forecasts', key: { orgId: 1, id: 1 }, options: { name: 'expiry_forecasts_orgId_id' } },
  { collection: 'expiry_forecasts', key: { orgId: 1, productId: 1 }, options: { name: 'expiry_forecasts_org_product' } },
  { collection: 'batch_movements', key: { orgId: 1, batchId: 1, createdAt: -1 }, options: { name: 'batch_movements_org_batch_created' } },
  { collection: 'batch_movements', key: { orgId: 1, productId: 1, createdAt: -1 }, options: { name: 'batch_movements_org_product_created' } },
  { collection: 'expiry_audit_logs', key: { orgId: 1, id: 1 }, options: { name: 'expiry_audit_logs_orgId_id' } },
  { collection: 'expiry_audit_logs', key: { orgId: 1, createdAt: -1 }, options: { name: 'expiry_audit_logs_org_created' } },
  { collection: 'review_requests', key: { orgId: 1, createdAt: -1 }, options: { name: 'review_requests_orgId_createdAt' } },
]

async function main() {
  console.log(`[mongo-indexes] ${dryRun ? 'DRY RUN' : 'APPLY'} — ${maskMongoUrl(MONGO_URL)} / ${DB_NAME}`)

  if (dryRun) {
    for (const { collection, key, options = {} } of INDEXES) {
      const name = options.name || Object.entries(key).map(([k, v]) => `${k}_${v}`).join('_')
      console.log(`  plan  ${collection}.${name} ${JSON.stringify(key)}`)
    }
    console.log(`[mongo-indexes] done — ${INDEXES.length} planned`)
    return
  }

  const client = new MongoClient(MONGO_URL)
  await client.connect()
  const db = client.db(DB_NAME)

  let created = 0
  let skipped = 0
  let conflicts = 0

  const existingCollections = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name),
  )

  for (const { collection, key, options = {} } of INDEXES) {
    const name = options.name || Object.entries(key).map(([k, v]) => `${k}_${v}`).join('_')
    if (!existingCollections.has(collection)) {
      await db.createCollection(collection)
      existingCollections.add(collection)
      console.log(`  init  ${collection} (created)`)
    }
    const existing = await db.collection(collection).indexes()
    if (existing.some((idx) => idx.name === name)) {
      console.log(`  skip  ${collection}.${name} (exists)`)
      skipped++
      continue
    }
    if (indexExistsForKey(existing, key)) {
      const existingName = existing.find((idx) => keysEqual(idx.key, key))?.name
      console.log(`  skip  ${collection}.${name} (same key as ${existingName})`)
      skipped++
      continue
    }
    try {
      await db.collection(collection).createIndex(key, { ...options, background: true })
      console.log(`  ok    ${collection}.${name}`)
      created++
    } catch (err) {
      if (isIndexConflictError(err)) {
        console.log(`  skip  ${collection}.${name} (index conflict — equivalent index present)`)
        conflicts++
        skipped++
        continue
      }
      throw err
    }
  }

  await client.close()
  console.log(`[mongo-indexes] done — ${created} created, ${skipped} skipped${conflicts ? `, ${conflicts} conflicts` : ''}`)
}

main().catch((err) => {
  console.error('[mongo-indexes] failed:', err.message)
  process.exit(1)
})
