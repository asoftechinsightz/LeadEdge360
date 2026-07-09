import { PRODUCTS, BRAND } from './constants.js'

const SITE = BRAND.website

/** Enriched product pitch library — brand + product posts */
export const PRODUCT_PITCHES = {
  leadedge360: {
    ...PRODUCTS.LEADEDGE360,
    url: `${SITE}/leadedge360`,
    demoUrl: `${SITE}/growth-audit`,
    pricingFrom: '₹9,999/mo',
    heroPlan: 'Business Growth ₹49,999/mo',
    features: [
      'AI lead scoring (Hot / Warm / Cold)',
      'Proposals & GST invoices in one click',
      '12 AI agents for sales & marketing',
      'Marketing Engine + content calendar',
      'WhatsApp-friendly sales workflows',
      'DPDP-aware lead capture',
    ],
    pitchAngles: [
      'Stop losing leads in Excel and WhatsApp',
      'Send GST-ready proposals in under 48 hours',
      'AI scores your pipeline before your team wakes up',
      'One CRM from first touch to invoice',
      'Built in India for Indian SMEs',
    ],
    hashtags: ['#LeadEdge360', '#AICRM', '#SalesAutomation', '#CRMIndia'],
  },
  retailedge360: {
    ...PRODUCTS.RETAILEDGE360,
    url: `${SITE}/retailedge360`,
    demoUrl: `${SITE}/contact`,
    pricingFrom: 'Custom retail plans',
    heroPlan: 'Retail intelligence suite',
    features: [
      'Inventory & stock intelligence',
      'Customer engagement & loyalty',
      'Multi-store visibility',
      'POS-ready integrations',
      'Retail analytics dashboard',
      'Omnichannel customer data',
    ],
    pitchAngles: [
      'Retail chaos ends with one intelligent platform',
      'Know what sells before shelves go empty',
      'Engage customers beyond the billing counter',
      'Modern retail needs modern intelligence',
      'From inventory to insights — one suite',
    ],
    hashtags: ['#RetailEdge360', '#RetailTech', '#IndianRetail', '#Omnichannel'],
  },
}

/** Rotate product by day: Mon/Wed/Fri LeadEdge, Tue/Thu Retail, weekend brand */
export function pickProductForDay(dayIndex, category) {
  if (category === 'product_pitch_retail') return PRODUCT_PITCHES.retailedge360
  if (category === 'product_pitch_leadedge') return PRODUCT_PITCHES.leadedge360
  if (category === 'product_demo') {
    return dayIndex % 2 === 0 ? PRODUCT_PITCHES.leadedge360 : PRODUCT_PITCHES.retailedge360
  }
  const rotation = [PRODUCT_PITCHES.leadedge360, PRODUCT_PITCHES.retailedge360, PRODUCT_PITCHES.leadedge360]
  return rotation[dayIndex % rotation.length]
}

export function buildProductPitchPrompt(product, category) {
  const p = PRODUCT_PITCHES[product.id] || product
  const feature = p.features[Math.floor(Math.random() * p.features.length)]
  const angle = p.pitchAngles[Math.floor(Math.random() * p.pitchAngles.length)]

  const prompts = {
    product_pitch_leadedge: `Product pitch for ${p.name}. Lead with: "${angle}". Highlight: ${feature}. CTA: ${p.cta}. Mention AsoftechInsightz as the company behind it.`,
    product_pitch_retail: `Product pitch for ${p.name}. Lead with: "${angle}". Highlight: ${feature}. CTA: ${p.cta}. Target retail owners in India.`,
    product_demo: `Short product demonstration post for ${p.name}. Show 2–3 features: ${p.features.slice(0, 3).join(', ')}. Include pricing hint "from ${p.pricingFrom}". CTA: ${p.demoUrl}`,
    educational: `Educational tip related to ${p.name}'s domain. Subtly mention ${p.name} as the solution. No hard sell.`,
    problem_solution: `Describe a pain point that ${p.name} solves. Problem → solution format. CTA: ${p.cta}`,
    company_updates: `Building-in-public update from AsoftechInsightz. Mention ${p.name} progress. Authentic founder tone.`,
    industry_news: `Industry trend comment relevant to ${p.name} buyers. Tie back to product value.`,
    brand: `AsoftechInsightz brand post. Suite: LeadEdge360 + RetailEdge360. Promise: ${BRAND.promise}. CTA: ${BRAND.demoCta}`,
  }
  return prompts[category] || prompts.product_pitch_leadedge
}

export function pitchFallbackBody(product, category) {
  const p = PRODUCT_PITCHES[product.id] || product
  const angle = p.pitchAngles[0]
  return `${angle}\n\n${p.name} — ${p.tagline}\n\n✅ ${p.features.slice(0, 3).join('\n✅ ')}\n\n${p.cta}\n\n${p.hashtags.join(' ')} #AsoftechInsightz`
}
