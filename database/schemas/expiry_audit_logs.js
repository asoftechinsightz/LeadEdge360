/** expiry_audit_logs collection schema */

export const EXPIRY_AUDIT_LOGS_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000801',
  orgId: 'demo-org',
  userId: 'admin-user-id',
  action: 'batch.create',
  entity: 'product_batch',
  entityId: '00000000-0000-4000-8000-000000000201',
  previousValue: null,
  newValue: { batchNumber: 'BATCH-ABCD-1A2B3C', quantityPurchased: 500 },
  reason: 'Stock purchase',
  ip: '127.0.0.1',
  ua: 'Mozilla/5.0',
  createdAt: new Date().toISOString(),
}

export const EXPIRY_AUDIT_LOGS_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'expiry_audit_logs_orgId_id' },
  { key: { orgId: 1, entityId: 1, createdAt: -1 }, name: 'expiry_audit_logs_org_entity' },
  { key: { orgId: 1, action: 1 }, name: 'expiry_audit_logs_org_action' },
  { key: { orgId: 1, createdAt: -1 }, name: 'expiry_audit_logs_org_created' },
  { key: { orgId: 1, userId: 1 }, name: 'expiry_audit_logs_org_user' },
]
