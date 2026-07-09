'use client'

import { useCallback, useState } from 'react'
import { apiGet, apiPost } from '@/src/lib/api'
import { toast } from 'sonner'

export function useRetailPosCheckout({ onSuccess } = {}) {
  const [loading, setLoading] = useState(false)

  const checkout = useCallback(async ({ items, paymentMethod }) => {
    if (!items?.length) {
      toast.error('Cart is empty')
      return
    }

    if (paymentMethod === 'cash') {
      setLoading(true)
      try {
        await apiPost('/retail/pos/checkout', { items, paymentMethod: 'cash' })
        toast.success('Sale completed')
        onSuccess?.()
      } catch (err) {
        toast.error(err.message || 'Checkout failed')
      } finally {
        setLoading(false)
      }
      return
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment gateway not loaded')
      return
    }

    setLoading(true)
    try {
      const data = await apiPost('/retail/pos/payment-order', { items, paymentMethod })
      if (!data.order || !data.key) {
        toast.error(data.message || 'Payment gateway not configured')
        return
      }

      const order = data.order
      const razorpay = new window.Razorpay({
        key: data.key,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: data.merchantName || 'Retail POS',
        description: `POS ${paymentMethod.toUpperCase()}`,
        handler: async (payment) => {
          try {
            await apiPost('/retail/pos/checkout', {
              items,
              paymentMethod,
              razorpay_order_id: payment.razorpay_order_id || order.id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            })
            toast.success('Payment successful')
            onSuccess?.()
          } catch (err) {
            toast.error(err.message || 'Checkout failed after payment')
          }
        },
        modal: {
          ondismiss: () => toast.message('Payment cancelled'),
        },
      })
      razorpay.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed')
      })
      razorpay.open()
    } catch (err) {
      toast.error(err.message || 'Could not start payment')
    } finally {
      setLoading(false)
    }
  }, [onSuccess])

  const lookupSku = useCallback(async (code) => {
    const data = await apiGet('/retail/inventory/lookup', { sku: code })
    return data.product || data
  }, [])

  return { checkout, lookupSku, loading }
}
