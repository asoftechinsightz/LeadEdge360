import SiteShell from '@/components/site/SiteShell'
import EnterprisePageTemplate from '@/components/enterprise/EnterprisePageTemplate'
import ResourcesGridSection from '@/components/enterprise/ResourcesGridSection'
import { RESOURCES_PAGE } from '@/lib/enterprise-pages'

export const metadata = {
  title: RESOURCES_PAGE.meta.title,
  description: RESOURCES_PAGE.meta.description,
  openGraph: {
    title: RESOURCES_PAGE.meta.title,
    description: RESOURCES_PAGE.meta.description,
  },
}

export default function ResourcesPage() {
  return (
    <SiteShell>
      <EnterprisePageTemplate
        page={RESOURCES_PAGE}
        showDashboardHero={false}
        showFeatures={false}
        showCustomerSuccess={false}
        insertAfter="challenges"
      >
        <ResourcesGridSection page={RESOURCES_PAGE} />
      </EnterprisePageTemplate>
    </SiteShell>
  )
}
