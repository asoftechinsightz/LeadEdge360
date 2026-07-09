import LegalDocument from '@/components/legal/LegalDocument'
import { CANCELLATION_POLICY } from '@/lib/legal-content'

export const metadata = {
  title: 'Cancellation Policy',
  description: 'How to cancel AsoftechInsightz SaaS subscriptions and manage account closure.',
}

export default function CancellationPolicyPage() {
  return <LegalDocument doc={CANCELLATION_POLICY} />
}
