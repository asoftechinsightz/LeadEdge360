import { EXPIRY_ROLES, ROLE_MAP } from './constants.js'
import { randomUUID } from 'crypto'

export function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return null
  const exp = new Date(expiryDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  exp.setHours(0, 0, 0, 0)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}

export function computeShelfLife(mfgDate, expiryDate) {
  if (!mfgDate || !expiryDate) return null
  const mfg = new Date(mfgDate)
  const exp = new Date(expiryDate)
  return Math.max(0, Math.ceil((exp - mfg) / (1000 * 60 * 60 * 24)))
}

export function deriveBatchStatus(expiryDate, quantityAvailable = 0, status = 'active') {
  if (['recalled', 'blocked'].includes(status)) return status
  if (quantityAvailable <= 0) return 'depleted'
  const days = daysUntilExpiry(expiryDate)
  if (days === null) return status
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'near_expiry'
  return 'active'
}

export function deriveAlertLevel(days) {
  if (days === null || days === undefined) return null
  if (days < 0) return 'critical'
  if (days <= 7) return 'high'
  if (days <= 15) return 'medium'
  if (days <= 30) return 'low'
  if (days <= 60) return 'planning'
  if (days <= 90) return 'forecast'
  return null
}

export function expiryColor(days) {
  if (days === null) return 'gray'
  if (days < 0) return 'red'
  if (days <= 7) return 'orange'
  if (days <= 30) return 'yellow'
  return 'green'
}

export function expiryColorClass(days) {
  const c = expiryColor(days)
  const map = {
    green: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    yellow: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    orange: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
    red: 'bg-red-500/15 text-red-700 border-red-500/30',
    gray: 'bg-muted text-muted-foreground border-border',
  }
  return map[c] || map.gray
}

export function generateBatchNumber(orgId, productId) {
  const ts = Date.now().toString(36).toUpperCase()
  const suffix = productId.slice(0, 4).toUpperCase()
  const rand = randomUUID().slice(0, 4).toUpperCase()
  return `BATCH-${suffix}-${ts}-${rand}`
}

export function parsePagination(searchParams, { defaultLimit = 25, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(maxLimit, Math.max(1, Number(searchParams.get('limit') || defaultLimit)))
  const sort = searchParams.get('sort') || 'expiryDate'
  const order = searchParams.get('order') === 'asc' ? 1 : -1
  const skip = (page - 1) * limit
  return { page, limit, sort, order, skip }
}

export function buildListResponse(items, total, page, limit) {
  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
    hasMore: page * limit < total,
  }
}

export function buildBatchFilter(orgId, params = {}) {
  const filter = { orgId }
  if (params.productId) filter.productId = params.productId
  if (params.warehouseId) filter.warehouseId = params.warehouseId
  if (params.supplier) filter.supplier = params.supplier
  if (params.status) filter.batchStatus = params.status
  if (params.batchNumber) filter.batchNumber = { $regex: params.batchNumber, $options: 'i' }
  if (params.category) filter.category = params.category
  if (params.expiryFrom || params.expiryTo) {
    filter.expiryDate = {}
    if (params.expiryFrom) filter.expiryDate.$gte = params.expiryFrom
    if (params.expiryTo) filter.expiryDate.$lte = params.expiryTo
  }
  if (params.search) {
    filter.$or = [
      { batchNumber: { $regex: params.search, $options: 'i' } },
      { productName: { $regex: params.search, $options: 'i' } },
      { supplier: { $regex: params.search, $options: 'i' } },
    ]
  }
  return filter
}

export function canPerformAction(user, action) {
  const role = ROLE_MAP[user?.role] || 'read_only'
  if (user?.role === 'SUPER_ADMIN') return true
  return (EXPIRY_ROLES[role] || []).includes(action)
}
