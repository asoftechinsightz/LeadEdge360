import { BRAND_NAME } from '@/lib/brand'
import { COMPANY, COMPANY_LEGAL, COMPANY_POSITIONING, LEADEDGE_MARKETING, RETAIL_MARKETING } from '@/lib/marketing-content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asoftechinsightz.com'

export default function StructuredData({ type = 'organization' }) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    legalName: COMPANY_LEGAL.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/asoftechinsightz-logo.svg`,
    description: COMPANY_POSITIONING.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: COMPANY.email,
      telephone: COMPANY.phoneTel,
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  }

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free trial available',
    },
    description: COMPANY_POSITIONING.description,
    featureList: [
      ...LEADEDGE_MARKETING.highlights,
      ...RETAIL_MARKETING.highlights,
    ],
  }

  const payload = type === 'software' ? software : organization

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
