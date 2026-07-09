import LegalDocument from '@/components/legal/LegalDocument'
import { COOKIE_POLICY } from '@/lib/legal-content'

export const metadata = {
  title: 'Cookie Policy',
  description: 'How AsoftechInsightz uses cookies and analytics on the marketing website.',
}

export default function CookiePolicyPage() {
  return <LegalDocument doc={COOKIE_POLICY} />
}
