export const formatCurrency = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`

export const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const INVOICE_STATUS_VARIANT = {
  PAID: 'success',
  PARTIAL: 'accent',
  PENDING: 'warning',
  DRAFT: 'secondary',
  OVERDUE: 'destructive',
  CANCELLED: 'outline',
}

export const PAYMENT_STATUS_VARIANT = {
  paid: 'success',
  created: 'warning',
  PENDING: 'warning',
  failed: 'destructive',
  cancelled: 'outline',
}

export const PLAN_HIGHLIGHTS = {
  starter: ['Lead capture', 'Basic CRM', 'Email support'],
  growth: ['CRM & pipeline', 'Proposals & invoices', 'Revenue dashboard'],
  scale: ['Everything in Growth', 'Partner portal', 'Advanced analytics', 'Dedicated support'],
}
