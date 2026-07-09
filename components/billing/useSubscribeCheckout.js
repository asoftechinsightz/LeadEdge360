'use client'

import { useState, useCallback } from 'react'
import { apiPost } from '@/src/lib/api'
import { toast } from 'sonner'

/**
 * Razorpay checkout — mirrors app/subscribe/page.js (/api/billing/checkout + verify).
 */
export function useSubscribeCheckout({ onSuccess } = {}) {
  const [loading, setLoading] = useState(false)

  const subscribe = useCallback(async (planId) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.')
      return
    }

    try {
      setLoading(true)
      const data = await apiPost('/billing/checkout', { planId })

      if (!data.order) {
        if (data.fallback) {
          toast.message('Razorpay not configured', {
            description: 'Please contact sales to complete your subscription.',
          })
          window.location.href = data.fallback
          return
        }
        toast.error(data.error || 'Checkout failed')
        return
      }

      const razorpay = new window.Razorpay({
        key: data.key,
        order_id: data.order.id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: data.merchantName || data.companyName || 'Subscription',
        description: data.planName || 'Subscription',
        handler: async (payment) => {
          try {
            const result = await apiPost('/billing/verify', { ...payment, planId })
            if (result.ok) {
              toast.success('Subscription activated')
              onSuccess?.()
            } else {
              toast.error('Payment verification failed')
            }
          } catch (err) {
            toast.error(err.message || 'Verification failed')
          }
        },
      })

      razorpay.open()
    } catch (err) {
      toast.error(err.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }, [onSuccess])

  return { subscribe, loading }
}
