'use client'

import { Badge } from '@/components/design-system/core/Badge'
import { PAYMENT_STATUS_VARIANT, INVOICE_STATUS_VARIANT } from './constants'

export function PaymentStatus({ status, type = 'payment' }) {
  const key = status || '—'
  const normalized = String(key).toUpperCase()
  const variantMap = type === 'invoice' ? INVOICE_STATUS_VARIANT : PAYMENT_STATUS_VARIANT
  const variant =
    variantMap[key] ||
    variantMap[normalized] ||
    variantMap[String(key).toLowerCase()] ||
    'outline'

  return (
    <Badge variant={variant} className="capitalize">
      {String(key).replace(/_/g, ' ')}
    </Badge>
  )
}
