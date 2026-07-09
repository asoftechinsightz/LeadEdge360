import LegalDocument from '@/components/legal/LegalDocument'
import { ACCEPTABLE_USE_POLICY } from '@/lib/legal-content'

export const metadata = {
  title: 'Acceptable Use Policy',
  description: 'Permitted and prohibited use of AsoftechInsightz platforms.',
}

export default function AcceptableUsePage() {
  return <LegalDocument doc={ACCEPTABLE_USE_POLICY} />
}
