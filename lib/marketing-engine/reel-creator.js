import { randomUUID } from 'crypto'
import { BRAND, COLLECTIONS, VIDEO_DURATIONS_SEC } from './constants.js'
import { generateMarketingJson } from './llm.js'
import { pickProductForDay, PRODUCT_PITCHES } from './product-pitch.js'

/**
 * Reel Creator Agent — 30–60s reel script with hook, problem, solution, CTA
 */
export async function runReelCreatorAgent(db, orgId, { date = new Date(), durationSec = 45, skipLlm = false } = {}) {
  const day = date.toISOString().slice(0, 10)
  const existing = await db.collection(COLLECTIONS.VIDEO_BRIEFS).findOne({
    orgId,
    'metadata.dailyBatch': day,
    type: 'reel_script',
  })
  if (existing) return { skipped: true, day, briefId: existing.id }

  const dayIndex = date.getUTCDay()
  const category = dayIndex % 2 === 0 ? 'product_pitch_leadedge' : 'product_pitch_retail'
  const product = pickProductForDay(dayIndex, category)
  const pitch = PRODUCT_PITCHES[product.id]

  if (!VIDEO_DURATIONS_SEC.includes(durationSec)) {
    durationSec = 45
  }

  const fallback = {
    title: `${pitch.name} — ${pitch.tagline}`,
    product: pitch.id,
    durationSec,
    hook: pitch.pitchAngles[0] + '?',
    problem: `Indian businesses struggle without integrated ${pitch.id === 'leadedge360' ? 'CRM' : 'retail intelligence'}.`,
    solution: `${pitch.name} by ${BRAND.company} — ${pitch.features.slice(0, 2).join('. ')}.`,
    companyIntro: `${BRAND.company}: ${BRAND.promise}`,
    voiceoverScript: [
      { sec: 0, text: 'Still tracking leads in Excel?' },
      { sec: 5, text: 'Leads get lost. Follow-ups slip. Proposals go late.' },
      { sec: 15, text: `${pitch.name} — ${pitch.features[0]}.` },
      { sec: 30, text: `${BRAND.company}. ${pitch.cta}` },
    ],
    subtitles: [pitch.pitchAngles[0], pitch.name, pitch.demoUrl?.replace('https://', '') || BRAND.website],
    scenes: [
      { sec: 0, visual: 'Frustrated owner at desk with spreadsheets', transition: 'fade' },
      { sec: 10, visual: `${pitch.name} product UI mockup`, transition: 'slide' },
      { sec: 25, visual: `${BRAND.logo} logo animation on navy background`, transition: 'zoom' },
      { sec: 35, visual: 'End screen: website, email, Book Demo CTA', transition: 'fade' },
    ],
    animationInstructions: 'Modern glass UI overlays. Brand blue #0066FF accents. Logo bottom-right.',
    backgroundMusic: 'Upbeat corporate tech — royalty-free',
    cta: {
      website: pitch.url || BRAND.website,
      email: BRAND.email,
      action: pitch.id === 'leadedge360' ? 'Book Growth Audit' : 'Book Retail Demo',
      url: pitch.demoUrl || `${BRAND.website}/contact`,
    },
  }

  const { data, engine, tokensUsed } = await generateMarketingJson({
    system: `Reel Creator for ${BRAND.company}. Product pitch reel for ${pitch.name}. Create a ${durationSec}s reel. Include hook, problem, solution, voiceover, subtitles, scenes. Use brand logo ${BRAND.logo}. No fake testimonials. Return JSON.`,
    user: `Product: ${pitch.name}. Features: ${pitch.features.join(', ')}. Audience: Indian ${pitch.id === 'retailedge360' ? 'retail owners' : 'SMB owners'}.`,
    fallback,
    skipLlm,
  })

  const brief = {
    id: randomUUID(),
    orgId,
    type: 'reel_script',
    status: 'pending_production',
    durationSec,
    agentId: 'reel-creator-agent',
    ...fallback,
    ...data,
    brand: { logo: BRAND.logo, colors: [BRAND.primaryColor, BRAND.navy] },
    engine,
    tokensUsed: tokensUsed || 0,
    metadata: { dailyBatch: day },
    createdAt: new Date().toISOString(),
  }

  await db.collection(COLLECTIONS.VIDEO_BRIEFS).insertOne(brief)
  return { skipped: false, day, briefId: brief.id, engine }
}
