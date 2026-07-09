import SiteShell from '@/components/site/SiteShell'
import EnterprisePageTemplate from '@/components/enterprise/EnterprisePageTemplate'
import { SOLUTIONS_PAGE } from '@/lib/enterprise-pages'

export const metadata = {
  title: SOLUTIONS_PAGE.meta.title,
  description: SOLUTIONS_PAGE.meta.description,
  openGraph: {
    title: SOLUTIONS_PAGE.meta.title,
    description: SOLUTIONS_PAGE.meta.description,
    images: [{ url: '/images/products/leadedge360-dashboard.svg', alt: 'LeadEdge360' }],
  },
}

export default function SolutionsPage() {
  return (
    <SiteShell>
      <EnterprisePageTemplate page={SOLUTIONS_PAGE} showDashboardHero={false} />
    </SiteShell>
  )
}
