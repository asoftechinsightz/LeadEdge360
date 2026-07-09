import { randomUUID } from 'crypto'
import {
  BRAND,
  COLLECTIONS,
  RESEARCH_TOPICS,
  TARGET_INDUSTRIES,
} from './constants.js'
import { generateMarketingJson } from './llm.js'

function todayId(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

/**
 * Research Agent — daily morning industry intelligence
 */
export async function runResearchAgent(db, orgId, { date = new Date(), skipLlm = false } = {}) {
  const day = todayId(date)
  const existing = await db.collection(COLLECTIONS.RESEARCH).findOne(
    { orgId, day },
    { projection: { _id: 0 } },
  )
  if (existing) return { skipped: true, day, research: existing }

  const fallback = {
    topics: RESEARCH_TOPICS.map((topic) => ({
      topic,
      headline: `${topic} trends for Indian SMBs — ${day}`,
      angle: `How ${BRAND.company} helps businesses with ${topic.toLowerCase()}.`,
      relevance: 'medium',
    })),
    trendingHashtags: ['#IndianSaaS', '#AICRM', '#DigitalTransformation', '#SMBGrowth'],
    summary: `Daily research for ${BRAND.company}: focus on AI, CRM, and automation for Indian SMEs.`,
  }

  const { data, engine, tokensUsed } = await generateMarketingJson({
    system: `You are the Research Agent for ${BRAND.company}. Research trending B2B topics for Indian SMBs. Never invent fake news or statistics. Return JSON: { topics: [{topic, headline, angle, relevance}], trendingHashtags: [], summary: string }`,
    user: `Date: ${day}. Industries: ${TARGET_INDUSTRIES.join(', ')}. Research areas: ${RESEARCH_TOPICS.join(', ')}.`,
    fallback,
    skipLlm,
  })

  const doc = {
    id: randomUUID(),
    orgId,
    day,
    agentId: 'research-agent',
    ...data,
    engine,
    tokensUsed: tokensUsed || 0,
    createdAt: new Date().toISOString(),
  }

  await db.collection(COLLECTIONS.RESEARCH).insertOne(doc)
  return { skipped: false, day, research: doc, engine }
}

export async function getLatestResearch(db, orgId) {
  return db.collection(COLLECTIONS.RESEARCH)
    .findOne({ orgId }, { sort: { day: -1 }, projection: { _id: 0 } })
}
