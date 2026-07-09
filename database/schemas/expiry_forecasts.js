/** expiry_forecasts collection schema */

export const EXPIRY_FORECASTS_EXAMPLE = {
  id: '00000000-0000-4000-8000-000000000601',
  orgId: 'demo-org',
  productId: '00000000-0000-4000-8000-000000000101',
  productName: 'Paracetamol 500mg',
  batchId: '00000000-0000-4000-8000-000000000201',
  recommendationType: 'discount',
  recommendation: 'Apply 30% discount to clear stock before expiry',
  predictedLoss: 2500.0,
  predictedWaste: 15,
  confidenceScore: 0.87,
  daysToExpiry: 12,
  quantityAtRisk: 100,
  engine: 'rules',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const EXPIRY_FORECASTS_INDEXES = [
  { key: { orgId: 1, id: 1 }, name: 'expiry_forecasts_orgId_id' },
  { key: { orgId: 1, productId: 1 }, name: 'expiry_forecasts_org_product' },
  { key: { orgId: 1, createdAt: -1 }, name: 'expiry_forecasts_org_created' },
  { key: { orgId: 1, confidenceScore: -1 }, name: 'expiry_forecasts_org_confidence' },
]
