import {
  computeLeadOnboardingPercent,
  getLeadOnboardingState,
  syncLeadOnboardingCookies,
} from '@/lib/onboarding/onboarding-flow'
import { seedOrgDemoData } from '@/lib/seed/demo-seed'

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 * @param {{ companyName: string, industry?: string, website?: string }} body
 */
export async function completeLeadOnboardingStep1(db, orgId, body) {
  const companyName = String(body.companyName || '').trim()
  const industry = String(body.industry || '').trim()
  if (!companyName) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'companyName is required'
    throw err
  }

  const now = new Date().toISOString()

  await db.collection('orgs').updateOne(
    { id: orgId },
    { $set: { name: companyName, industry: industry || null, updatedAt: now } },
  )

  await db.collection('onboarding_profiles').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        companyName,
        industry,
        website: body.website || '',
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )

  await db.collection('onboarding_progress').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        leadQuickSetupRequired: true,
        'leadQuickSetup.companyName': true,
        'leadQuickSetup.industry': industry,
        'leadQuickSetup.completed': false,
        completedPercent: computeLeadOnboardingPercent({
          companyName: true,
          demoLeadsImported: false,
          aiScoreViewed: false,
        }),
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )

  return { step: 1, complete: true, companyName, industry }
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function completeLeadOnboardingStep2(db, orgId) {
  const profile = await db.collection('onboarding_profiles').findOne({ orgId })
  const industry = profile?.industry || 'general'
  const seedResult = await seedOrgDemoData(db, orgId, {
    industry,
    companyName: profile?.companyName,
  })

  const now = new Date().toISOString()
  await db.collection('onboarding_progress').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        leadQuickSetupRequired: true,
        'leadQuickSetup.demoLeadsImported': true,
        'leadQuickSetup.demoSeedAt': now,
        'leadQuickSetup.completed': false,
        completedPercent: computeLeadOnboardingPercent({
          companyName: true,
          demoLeadsImported: true,
          aiScoreViewed: false,
        }),
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  return { step: 2, complete: true, seed: seedResult }
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function completeLeadOnboardingStep3(db, orgId) {
  const now = new Date().toISOString()
  await db.collection('onboarding_progress').updateOne(
    { orgId },
    {
      $set: {
        orgId,
        leadQuickSetupRequired: true,
        'leadQuickSetup.aiScoreViewed': true,
        'leadQuickSetup.completed': true,
        'leadQuickSetup.completedAt': now,
        completedPercent: 100,
        updatedAt: now,
      },
    },
    { upsert: true },
  )

  await db.collection('orgs').updateOne(
    { id: orgId },
    { $set: { leadQuickSetupRequired: false, updatedAt: now } },
  )

  return { step: 3, complete: true }
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} orgId
 */
export async function getLeadOnboardingStatus(db, orgId) {
  const progress = await db.collection('onboarding_progress').findOne({ orgId })
  const state = getLeadOnboardingState(progress)
  const cookies = await syncLeadOnboardingCookies(db, orgId)
  return { progress, state, cookies }
}
