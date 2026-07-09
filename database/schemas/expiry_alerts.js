/** expiry_alerts collection schema */

export const EXPIRY_ALERTS_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000301',
  orgId: 'demo-org',
  batchId: '00000000-0000-4000-8000-000000000201',
  batchNumber: 'BATCH-ABCD-1A2B3C',
  productId: '00000000-0000-4000-8000-000000000101',
  productName: 'Paracetamol 500mg',
  level: 'high',
  daysRemaining: 5,
  expiryDate: '2026-06-01T00:00:00.000Z',
  quantityAvailable: 420,
  warehouseId: '00000000-0000-4000-8000-000000000100',
  message: 'Product expires in 5 days',
  acknowledged: false,
  acknowledgedBy: null,
  acknowledgedAt: null,
  channels: ['dashboard', 'email'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const EXPIRY_ALERTS_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'expiry_alerts_orgId_id' },
  { key: { orgId: 1, level: 1, acknowledged: 1 }, name: 'expiry_alerts_org_level_ack' },
  { key: { orgId: 1, batchId: 1 }, name: 'expiry_alerts_org_batch' },
  { key: { orgId: 1, createdAt: -1 }, name: 'expiry_alerts_org_created' },
  { key: { orgId: 1, expiryDate: 1 }, name: 'expiry_alerts_org_expiry' },
]
