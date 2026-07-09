import LegalDocument from '@/components/legal/LegalDocument'
import { REFUND_POLICY } from '@/lib/legal-content'

export const metadata = {
  title: 'Refund Policy',
  description: 'Refund and payment dispute policy for AsoftechInsightz SaaS subscriptions.',
}

export default function RefundPolicyPage() {
  return <LegalDocument doc={REFUND_POLICY} />
}
