/** inventory_disposals collection schema */

export const INVENTORY_DISPOSALS_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000501',
  orgId: 'demo-org',
  disposalNumber: 'DSP-20250707-001',
  batchId: '00000000-0000-4000-8000-000000000201',
  batchNumber: 'BATCH-ABCD-1A2B3C',
  productId: '00000000-0000-4000-8000-000000000101',
  productName: 'Paracetamol 500mg',
  quantity: 25,
  reason: 'expired',
  status: 'pending',
  disposalMethod: null,
  disposalDate: null,
  financialLoss: 1125.0,
  images: [],
  notes: '',
  approvedBy: null,
  approvedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin-user-id',
  updatedBy: 'admin-user-id',
}

export const INVENTORY_DISPOSALS_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'inventory_disposals_orgId_id' },
  { key: { orgId: 1, disposalNumber: 1 }, name: 'inventory_disposals_org_number', unique: true },
  { key: { orgId: 1, status: 1 }, name: 'inventory_disposals_org_status' },
  { key: { orgId: 1, reason: 1 }, name: 'inventory_disposals_org_reason' },
  { key: { orgId: 1, createdAt: -1 }, name: 'inventory_disposals_org_created' },
]
