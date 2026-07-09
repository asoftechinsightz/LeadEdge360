import SiteShell from '@/components/site/SiteShell'
import EnterprisePageTemplate from '@/components/enterprise/EnterprisePageTemplate'
import IndustryProfilesSection from '@/components/enterprise/IndustryProfilesSection'
import { INDUSTRIES_PAGE, INDUSTRY_PROFILES } from '@/lib/enterprise-pages'

export const metadata = {
  title: INDUSTRIES_PAGE.meta.title,
  description: INDUSTRIES_PAGE.meta.description,
  openGraph: {
    title: INDUSTRIES_PAGE.meta.title,
    description: INDUSTRIES_PAGE.meta.description,
  },
}

export default function IndustriesPage() {
  return (
    <SiteShell>
      <EnterprisePageTemplate page={INDUSTRIES_PAGE} showDashboardHero={false} showFeatures={false} showCustomerSuccess={false} insertAfter="challenges">
        <IndustryProfilesSection industries={INDUSTRY_PROFILES} />
      </EnterprisePageTemplate>
    </SiteShell>
  )
}
