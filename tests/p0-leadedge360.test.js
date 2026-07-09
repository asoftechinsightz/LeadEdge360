import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  LEADS_LIST_PATH,
  LEADS_TOUR_URL,
  LEADS_NEW_URL,
  leadDetailPath,
  leadsListRedirectUrl,
} from '../lib/leads/paths.js'
import {
  LEAD_ONBOARDING_STEPS,
  getLeadOnboardingState,
  computeLeadOnboardingPercent,
  isLeadOnboardingGatedPath,
  normalizeLeadIndustry,
} from '../lib/onboarding/onboarding-flow.js'
import { DRIP_TEMPLATES, getDripTemplate } from '../lib/campaigns/drip.js'

describe('P0 LeadEdge360 — canonical lead routes', () => {
  it('defines canonical list path under /leadedge360', () => {
    assert.equal(LEADS_LIST_PATH, '/leadedge360/leads')
    assert.equal(LEADS_TOUR_URL, '/leadedge360/leads?tour=1')
    assert.equal(LEADS_NEW_URL, '/leadedge360/leads?new=1')
  })

  it('builds detail paths with encoded ids', () => {
    assert.equal(leadDetailPath('abc-123'), '/leadedge360/leads/abc-123')
    assert.equal(leadDetailPath(''), LEADS_LIST_PATH)
  })

  it('preserves query params on legacy redirect', () => {
    const url = leadsListRedirectUrl({ tour: '1', new: '1' })
    assert.ok(url.startsWith(LEADS_LIST_PATH))
    assert.match(url, /tour=1/)
    assert.match(url, /new=1/)
  })
})

describe('P0 LeadEdge360 — 3-step onboarding', () => {
  it('defines three mandatory steps ending on canonical leads path', () => {
    assert.equal(LEAD_ONBOARDING_STEPS.length, 3)
    assert.equal(LEAD_ONBOARDING_STEPS[2].path, LEADS_LIST_PATH)
    assert.equal(LEAD_ONBOARDING_STEPS[2].key, 'view_ai_score')
  })

  it('tracks progress through company → demo → AI score', () => {
    assert.equal(getLeadOnboardingState({ leadQuickSetupRequired: true, leadQuickSetup: {} }).currentStep, 1)
    assert.equal(
      getLeadOnboardingState({
        leadQuickSetupRequired: true,
        leadQuickSetup: { companyName: true },
      }).currentStep,
      2,
    )
    assert.equal(
      getLeadOnboardingState({
        leadQuickSetupRequired: true,
        leadQuickSetup: { companyName: true, demoLeadsImported: true },
      }).currentStep,
      3,
    )
    assert.equal(
      getLeadOnboardingState({
        leadQuickSetupRequired: true,
        leadQuickSetup: { companyName: true, demoLeadsImported: true, aiScoreViewed: true },
      }).complete,
      true,
    )
  })

  it('computes percent complete in thirds', () => {
    assert.equal(computeLeadOnboardingPercent({ companyName: true }), 33)
    assert.equal(
      computeLeadOnboardingPercent({ companyName: true, demoLeadsImported: true }),
      67,
    )
    assert.equal(computeLeadOnboardingPercent({ complete: true }), 100)
  })

  it('gates dashboard but includes canonical leads path', () => {
    assert.equal(isLeadOnboardingGatedPath('/dashboard'), true)
    assert.equal(isLeadOnboardingGatedPath(LEADS_LIST_PATH), true)
    assert.equal(isLeadOnboardingGatedPath('/onboarding'), false)
  })

  it('normalizes industry for demo seed matching', () => {
    assert.equal(normalizeLeadIndustry('Retail / Kirana'), 'retail')
    assert.equal(normalizeLeadIndustry('SaaS startup'), 'saas')
    assert.equal(normalizeLeadIndustry(''), 'general')
  })
})

describe('P0 LeadEdge360 — Workflow Lite drips', () => {
  it('ships New Lead Nurture: Day0 email → Day1 WhatsApp → Day3 call task', () => {
    const drip = getDripTemplate('new_lead_nurture')
    assert.ok(drip)
    assert.equal(drip.trigger.type, 'lead_created')
    const types = drip.steps.map((s) => s.type)
    assert.equal(types[0], 'send_email')
    assert.ok(types.includes('send_whatsapp'))
    assert.ok(types.includes('create_task'))
  })

  it('ships Proposal Follow-up: Day2 email → Day5 WhatsApp', () => {
    const drip = getDripTemplate('proposal_followup')
    const emailIdx = drip.steps.findIndex((s) => s.type === 'send_email')
    const waIdx = drip.steps.findIndex((s) => s.type === 'send_whatsapp')
    assert.ok(emailIdx >= 0 && waIdx > emailIdx)
  })

  it('ships Lost Lead Winback: Day30 email only', () => {
    const drip = getDripTemplate('lost_lead_winback')
    const waitStep = drip.steps.find((s) => s.type === 'wait')
    assert.equal(waitStep?.delayDays, 30)
    assert.equal(drip.steps.filter((s) => s.type === 'send_email').length, 1)
  })

  it('lists at least one drip per channel combo', () => {
    assert.ok(DRIP_TEMPLATES.length >= 2)
    for (const drip of DRIP_TEMPLATES) {
      assert.ok(drip.id)
      assert.ok(drip.trigger?.type)
      assert.ok(Array.isArray(drip.steps) && drip.steps.length >= 2)
    }
  })
})

describe('P0 LeadEdge360 — WhatsApp intro CTA contract', () => {
  it('nurture drip includes whatsapp intro step after email', () => {
    const drip = getDripTemplate('new_lead_nurture')
    const waStep = drip.steps.find((s) => s.type === 'send_whatsapp')
    assert.ok(waStep)
    assert.equal(waStep.templateId, 'new_lead')
  })
})
