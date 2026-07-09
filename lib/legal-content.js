/**
 * Legal page content — Razorpay & DPDP aligned.
 * Have counsel review before production merchant onboarding.
 */

import { COMPANY } from '@/lib/marketing-content'

const LAST_UPDATED = 'July 7, 2026'
const GRIEVANCE_EMAIL = 'privacy@asoftechinsightz.com'
const SUPPORT_EMAIL = COMPANY.email

export const LEGAL_META = {
  lastUpdated: LAST_UPDATED,
  company: COMPANY.name,
  email: SUPPORT_EMAIL,
  grievanceEmail: GRIEVANCE_EMAIL,
}

export const REFUND_POLICY = {
  title: 'Refund Policy',
  slug: 'refund-policy',
  sections: [
    {
      heading: '1. Scope',
      body: `${COMPANY.name} provides subscription-based SaaS products (LeadEdge360, RetailEdge360, Trinetra360) and related consulting services. This policy explains how refunds are handled for digital subscriptions and services purchased through our website or invoiced directly.`,
    },
    {
      heading: '2. Subscription refunds',
      body: 'Monthly and annual SaaS subscriptions are generally non-refundable once the billing period has started, except where required by applicable law or explicitly stated in your order confirmation. If you cancel, access continues until the end of the paid period; we do not provide prorated refunds unless agreed in writing.',
    },
    {
      heading: '3. Free trial & pilot programs',
      body: 'Pilot or trial periods are offered at our discretion. Charges during a paid pilot follow the agreement signed with your organization. Contact us before renewal if you wish to discontinue.',
    },
    {
      heading: '4. Consulting & implementation',
      body: 'Professional services billed separately may be refundable only for undelivered work, assessed case-by-case. Delivered milestones are non-refundable.',
    },
    {
      heading: '5. Payment disputes',
      body: 'For Razorpay or bank charges you do not recognize, contact us at ' + SUPPORT_EMAIL + ' within 7 days. We will investigate with payment records and respond within 10 business days.',
    },
    {
      heading: '6. How to request a refund',
      body: `Email ${SUPPORT_EMAIL} with your organization name, invoice or payment ID, reason, and billing date. Approved refunds are processed to the original payment method within 7–14 business days.`,
    },
  ],
}

export const CANCELLATION_POLICY = {
  title: 'Cancellation Policy',
  slug: 'cancellation-policy',
  sections: [
    {
      heading: '1. Self-service cancellation',
      body: 'Organization administrators may cancel subscriptions from the billing settings in the application or by emailing ' + SUPPORT_EMAIL + '.',
    },
    {
      heading: '2. Effective date',
      body: 'Cancellation takes effect at the end of the current billing cycle unless otherwise agreed. You retain access until that date.',
    },
    {
      heading: '3. Data export',
      body: 'Before cancellation, export your data using in-app tools or request an export under our Privacy Policy. After account closure, data may be deleted per retention schedules.',
    },
    {
      heading: '4. Reactivation',
      body: 'You may reactivate within 90 days subject to plan availability and outstanding dues.',
    },
  ],
}

export const COOKIE_POLICY = {
  title: 'Cookie Policy',
  slug: 'cookie-policy',
  sections: [
    {
      heading: '1. What we use cookies for',
      body: 'We use essential cookies for authentication and security, analytics cookies (e.g. Google Analytics) to understand site usage, and preference cookies to remember consent choices.',
    },
    {
      heading: '2. Your choices',
      body: 'On first visit, our consent banner lets you accept or manage preferences. You may also control cookies through your browser settings.',
    },
    {
      heading: '3. Third parties',
      body: 'Payment processors (Razorpay), calendar booking (Calendly), and analytics providers may set their own cookies when you interact with embedded flows.',
    },
    {
      heading: '4. Contact',
      body: `Questions: ${GRIEVANCE_EMAIL}`,
    },
  ],
}

export const SHIPPING_DELIVERY_POLICY = {
  title: 'Shipping & Delivery Policy (Digital Products)',
  slug: 'shipping-delivery',
  sections: [
    {
      heading: '1. Digital delivery',
      body: `${COMPANY.name} delivers software exclusively as a digital service. There is no physical shipping.`,
    },
    {
      heading: '2. Access provision',
      body: 'After successful payment or pilot provisioning, account credentials are sent to the registered email within 24 hours (typically immediate for self-serve signup when enabled).',
    },
    {
      heading: '3. Downloads',
      body: 'Mobile apps and documentation are available from our Download center or official app distribution channels linked from the site.',
    },
    {
      heading: '4. Support',
      body: `Delivery issues: ${SUPPORT_EMAIL} · ${COMPANY.phone} · ${COMPANY.supportHours}`,
    },
  ],
}

export const ACCEPTABLE_USE_POLICY = {
  title: 'Acceptable Use Policy',
  slug: 'acceptable-use',
  sections: [
    {
      heading: '1. Permitted use',
      body: 'Use our platforms for lawful business purposes consistent with your subscription and applicable Indian law.',
    },
    {
      heading: '2. Prohibited activities',
      body: 'You may not: send spam or unsolicited messages; attempt unauthorized access; upload malware; infringe intellectual property; process illegal goods or services; or use the platform for activities prohibited by Razorpay or applicable payment network rules.',
    },
    {
      heading: '3. Enforcement',
      body: 'We may suspend accounts that violate this policy after notice where practicable. Serious violations may result in immediate termination.',
    },
    {
      heading: '4. Reporting abuse',
      body: `Report to ${SUPPORT_EMAIL}`,
    },
  ],
}
