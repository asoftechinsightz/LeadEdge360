'use client'

import {
  EnterpriseHero,
  BusinessChallengesSection,
  AISolutionsSection,
  ProductMappingSection,
  FeaturesGridSection,
  BusinessOutcomesSection,
  IntegrationsStripSection,
  CustomerSuccessStrip,
  SecurityStripSection,
  FAQSection,
  EnterpriseFinalCTA,
} from './sections'

/**
 * Unified enterprise page layout — same anatomy on every marketing page.
 * Brand components (logo, colors) are unchanged; only page structure is standardized.
 */
export default function EnterprisePageTemplate({
  page,
  showDashboardHero = true,
  showFeatures = true,
  showCustomerSuccess = true,
  insertAfter = 'challenges',
  children,
}) {
  const insertSlot = (position) => (insertAfter === position && children ? children : null)

  return (
    <>
      <EnterpriseHero
        hero={page.hero}
        showDashboard={showDashboardHero}
        productId={page.hero?.productId}
      />
      {insertSlot('hero')}
      <BusinessChallengesSection challenges={page.challenges} title={page.challengesTitle} />
      {insertSlot('challenges')}
      <AISolutionsSection solutions={page.aiSolutions} />
      <ProductMappingSection products={page.products} />
      {insertSlot('products')}
      {showFeatures && <FeaturesGridSection features={page.features} />}
      <BusinessOutcomesSection outcomes={page.outcomes} />
      {insertSlot('outcomes')}
      <IntegrationsStripSection integrations={page.integrations} />
      {showCustomerSuccess && page.customerSuccess && (
        <CustomerSuccessStrip customerSuccess={page.customerSuccess} />
      )}
      <SecurityStripSection security={page.security} />
      {insertSlot('security')}
      {insertSlot('beforeCta')}
      <FAQSection faq={page.faq} />
      <EnterpriseFinalCTA cta={page.cta} />
    </>
  )
}
