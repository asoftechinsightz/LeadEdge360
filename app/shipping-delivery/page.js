import LegalDocument from '@/components/legal/LegalDocument'
import { SHIPPING_DELIVERY_POLICY } from '@/lib/legal-content'

export const metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Digital product delivery for AsoftechInsightz SaaS platforms.',
}

export default function ShippingDeliveryPage() {
  return <LegalDocument doc={SHIPPING_DELIVERY_POLICY} />
}
