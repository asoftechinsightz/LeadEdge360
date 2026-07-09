'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost } from '@/src/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PRODUCTS, BRAND_LOGOS } from '@/lib/brand'
import WelcomeTour from '@/components/onboarding/WelcomeTour'
import { LEADS_TOUR_URL } from '@/lib/leads/paths'

const PRODUCT_ROUTES = {
  leadedge360: '/dashboard',
  retailedge360: '/retailedge360',
  supportedge360: '/dashboard',
}

const FALLBACK_PRODUCTS = [
  { code: 'leadedge360', name: 'LeadEdge360' },
  { code: 'retailedge360', name: 'RetailEdge360' },
]

const PRODUCT_META = {
  leadedge360: { ...PRODUCTS.leadedge360, logo: BRAND_LOGOS.leadedge360, accent: 'bg-[hsl(var(--brand-growth))]' },
  retailedge360: { ...PRODUCTS.retailedge360, logo: BRAND_LOGOS.retailedge360, accent: 'bg-[hsl(var(--brand-orange))]' },
}

function normalizeProduct(product) {
  if (typeof product === 'string') {
    const code = product.toLowerCase()
    return { code, name: product, displayName: product }
  }
  const code = String(product.code || product.name || '').toLowerCase()
  return {
    code,
    name: product.name || code,
    displayName: product.displayName || product.description || product.name || code,
  }
}

export default function ProductSelectionPage() {
  const router = useRouter()
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => apiGet('/products'),
  })

  const onboardingQuery = useQuery({
    queryKey: ['lead-onboarding-status'],
    queryFn: () => apiGet('/onboarding/lead-step'),
    retry: false,
  })

  const switchMutation = useMutation({
    mutationFn: (product) => apiPost('/products/switch', { product }),
    onSuccess: (_, product) => {
      const code = String(product).toLowerCase()
      const onboarding = onboardingQuery.data?.state
      if (code === 'leadedge360' && onboarding?.required && !onboarding?.complete) {
        if (onboarding.demoLeadsImported && !onboarding.aiScoreViewed) {
          router.push(LEADS_TOUR_URL)
        } else {
          router.push('/onboarding')
        }
        return
      }
      router.push(PRODUCT_ROUTES[code] || '/dashboard')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to switch product')
    },
  })

  const products = useMemo(() => {
    const raw = productsQuery.data?.products || []
    if (!productsQuery.isLoading && raw.length === 0) return FALLBACK_PRODUCTS
    return raw.map(normalizeProduct).filter((p) => p.code && PRODUCT_META[p.code])
  }, [productsQuery.data?.products, productsQuery.isLoading])

  return (
    <main className="min-h-screen bg-[hsl(var(--brand-navy))] text-white">
      <WelcomeTour />
      <div className="max-w-7xl mx-auto px-8 py-20">

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display">
            Welcome to Asoftech Business Suite
          </h1>

          <p className="text-xl text-slate-300 max-w-4xl mx-auto">
            One platform. Multiple growth solutions.
            <br />
            Choose your product workspace to continue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {productsQuery.isLoading && (
            <div className="md:col-span-2 text-center text-slate-300">Loading products...</div>
          )}
          {!productsQuery.isLoading && products.map((product) => {
            const meta = PRODUCT_META[product.code] || {}
            return (
              <div key={product.code} className="brand-glass-card brand-gradient-border rounded-3xl p-10 bg-slate-900/40">
                <Image
                  src={meta.logo || BRAND_LOGOS.master}
                  alt={product.name}
                  width={200}
                  height={56}
                  className="h-12 w-auto object-contain mb-4"
                />
                <p className="text-sm text-[hsl(var(--brand-growth))]">{meta.tagline}</p>
                <h2 className="text-2xl font-bold mt-2">
                  {product.displayName || product.name}
                </h2>
                <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
                <Button
                  className={`mt-8 rounded-xl px-8 py-4 font-semibold text-white ${meta.accent || 'bg-blue-600'} hover:opacity-90`}
                  onClick={() => switchMutation.mutate(product.code)}
                  disabled={switchMutation.isPending}
                >
                  Access {product.name}
                </Button>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}
