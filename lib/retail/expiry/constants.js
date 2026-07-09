/** Enterprise Expiry Management — shared constants */

export const BATCH_STATUSES = ['active', 'near_expiry', 'critical', 'expired', 'recalled', 'blocked', 'depleted']

export const ALERT_LEVELS = {
  critical: { label: 'Critical', daysMax: 0, priority: 1 },
  high: { label: 'High', daysMax: 7, priority: 2 },
  medium: { label: 'Medium', daysMax: 15, priority: 3 },
  low: { label: 'Low', daysMax: 30, priority: 4 },
  planning: { label: 'Planning', daysMax: 60, priority: 5 },
  forecast: { label: 'Forecast', daysMax: 90, priority: 6 },
}

export const RETURN_STATUSES = ['pending', 'approved', 'rejected', 'shipped', 'received', 'credited', 'refunded', 'closed']

export const DISPOSAL_REASONS = ['expired', 'damaged', 'contaminated', 'regulatory_recall']

export const DISPOSAL_STATUSES = ['pending', 'approved', 'rejected', 'completed']

export const DISPOSAL_METHODS = ['incineration', 'landfill', 'recycling', 'return_to_supplier', 'other']

export const MOVEMENT_TYPES = ['purchase', 'sale', 'return', 'disposal', 'transfer', 'adjustment', 'damage']

export const EXPIRY_ROLES = {
  admin: ['override_warning', 'dispose', 'approve_return', 'edit_batch', 'bulk_import', 'bulk_export'],
  store_manager: ['override_warning', 'dispose', 'approve_return', 'edit_batch'],
  inventory_manager: ['edit_batch', 'bulk_import', 'bulk_export'],
  cashier: ['override_warning'],
  auditor: [],
  read_only: [],
}

export const ROLE_MAP = {
  SUPER_ADMIN: 'admin',
  ORG_ADMIN: 'admin',
  SALES_MANAGER: 'store_manager',
  SALES_EXECUTIVE: 'cashier',
  FINANCE: 'auditor',
}

export const WARNING_THRESHOLDS = [30, 15, 7]

export const COLLECTIONS = {
  BATCHES: 'product_batches',
  ALERTS: 'expiry_alerts',
  RETURNS: 'expiry_returns',
  DISPOSALS: 'inventory_disposals',
  FORECASTS: 'expiry_forecasts',
  MOVEMENTS: 'batch_movements',
  AUDIT: 'expiry_audit_logs',
}
