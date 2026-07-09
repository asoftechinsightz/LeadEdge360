import SiteShell from '@/components/site/SiteShell'
import EnterprisePageTemplate from '@/components/enterprise/EnterprisePageTemplate'
import { SOLUTIONS_PAGE } from '@/lib/enterprise-pages'

const IMPLEMENTATION_PAGE = {
  ...SOLUTIONS_PAGE,
  meta: {
    title: 'Implementation & Success',
    description: 'Product deployment, onboarding, and integration for LeadEdge360 and RetailEdge360 — not generic IT staffing.',
  },
  hero: {
    eyebrow: 'Implementation',
    title: 'Deploy AI SaaS',
    accent: 'with measurable outcomes',
    description:
      'We help you go live on LeadEdge360 and RetailEdge360 with migration, integrations, training, and success management — product implementation, not body-shop consulting.',
    productId: 'leadedge360',
    metrics: [
      { label: 'Typical pilot', value: '2–4 wks' },
      { label: 'Products', value: '2' },
      { label: 'Support', value: 'Dedicated' },
    ],
  },
  challengesTitle: 'Why teams need guided implementation',
  cta: {
    ...SOLUTIONS_PAGE.cta,
    title: 'Schedule implementation planning',
    description: 'We scope pilot, migration, and integration for your product choice.',
  },
}

export const metadata = {
  title: IMPLEMENTATION_PAGE.meta.title,
  description: IMPLEMENTATION_PAGE.meta.description,
}

export default function ServicesPage() {
  return (
    <SiteShell>
      <EnterprisePageTemplate page={IMPLEMENTATION_PAGE} showDashboardHero={false} />
    </SiteShell>
  )
}
