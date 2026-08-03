import areasRule from '../../config/aeo/rules/missing-service-areas.json'
import keywordsRule from '../../config/aeo/rules/missing-keywords.json'
import { DEFAULT_TERRITORIES } from './compute.js'

export function ruleMissingServiceAreas(profile, kpis) {
  const serviceAreas = profile?.serviceAreas?.length
    ? profile.serviceAreas
    : DEFAULT_TERRITORIES

  const byTerr = kpis?.byTerritory || []
  const recommendations = []

  for (const area of serviceAreas) {
    const row = byTerr.find((t) => t.name === area)
    const leads = row?.leads ?? 0
    if (!row || leads === 0) {
      recommendations.push(
        areasRule.messageTemplate
          .replace('{{area}}', area)
          .replace('{{leads}}', String(leads))
      )
    }
  }

  return {
    id: areasRule.id,
    type: 'rule',
    recommendations,
  }
}

export function ruleMissingKeywords(profile) {
  const text = [
    profile?.descriptionShort,
    profile?.descriptionLong,
    (profile?.keywords || []).join(' '),
  ]
    .join(' ')
    .toLowerCase()

  const recommendations = []
  for (const keyword of keywordsRule.seedKeywords || []) {
    if (!text.includes(keyword.toLowerCase())) {
      recommendations.push(
        keywordsRule.messageTemplate.replace('{{keyword}}', keyword)
      )
    }
  }

  return {
    id: keywordsRule.id,
    type: 'rule',
    recommendations: recommendations.slice(0, 5),
  }
}

export function growthScannerSignals(leads, kpis) {
  const signals = []
  const cold = (leads || []).filter((l) => l.label === 'Cold' || (l.score ?? 0) < 50)
  const noCompany = (leads || []).filter((l) => !l.company?.trim())
  const google = (kpis?.bySource || []).find((s) => s.name === 'google')
  const googleCount = google?.value ?? 0

  if (cold.length > 0) {
    signals.push(`${cold.length} leads need optimization (cold or low score)`)
  }
  if (noCompany.length > 0) {
    signals.push(`${noCompany.length} leads missing company name`)
  }
  if (googleCount === 0) {
    signals.push('No Google-sourced leads — improve local visibility')
  }

  const emptyTerritories = (kpis?.byTerritory || []).filter((t) => t.leads === 0)
  if (emptyTerritories.length > 0) {
    signals.push(
      `${emptyTerritories.length} territories with zero pipeline activity`
    )
  }

  return signals
}

export function buildRuleRecommendations(profile, kpis, leads) {
  const out = []
  const areas = ruleMissingServiceAreas(profile, kpis)
  const keywords = ruleMissingKeywords(profile)
  const scanner = growthScannerSignals(leads, kpis)

  if (areas.recommendations.length) {
    out.push({ category: 'Service areas', items: areas.recommendations })
  }
  if (keywords.recommendations.length) {
    out.push({ category: 'Keywords', items: keywords.recommendations })
  }
  if (scanner.length) {
    out.push({ category: 'Growth scanner', items: scanner })
  }

  const completeness = profile?.descriptionLong?.length ?? 0
  if (completeness < 150) {
    out.push({
      category: 'Profile',
      items: ['Add a long description (150+ characters) for answer-engine visibility'],
    })
  }

  const faqCount = profile?.faqs?.length ?? 0
  if (faqCount < 5) {
    out.push({
      category: 'FAQs',
      items: [`Add ${5 - faqCount} more FAQ pairs (target: 5)`],
    })
  }

  return out
}
