/** batch_movements collection schema */

export const BATCH_MOVEMENTS_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000701',
  orgId: 'demo-org',
  batchId: '00000000-0000-4000-8000-000000000201',
  batchNumber: 'BATCH-ABCD-1A2B3C',
  productId: '00000000-0000-4000-8000-000000000101',
  movementType: 'sale',
  quantity: -2,
  quantityBefore: 422,
  quantityAfter: 420,
  referenceType: 'retail_sale',
  referenceId: 'sale-uuid',
  warehouseId: '00000000-0000-4000-8000-000000000100',
  notes: 'POS checkout',
  createdAt: new Date().toISOString(),
  createdBy: 'cashier-user-id',
}

export const BATCH_MOVEMENTS_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'batch_movements_orgId_id' },
  { key: { orgId: 1, batchId: 1, createdAt: -1 }, name: 'batch_movements_org_batch_created' },
  { key: { orgId: 1, productId: 1, createdAt: -1 }, name: 'batch_movements_org_product_created' },
  { key: { orgId: 1, movementType: 1 }, name: 'batch_movements_org_type' },
  { key: { orgId: 1, createdAt: -1 }, name: 'batch_movements_org_created' },
]
