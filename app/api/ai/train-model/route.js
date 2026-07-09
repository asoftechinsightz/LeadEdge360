export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardAiRequest, aiError } from '@/lib/ai/api-helpers'
import { trainScoringModel } from '@/lib/ai/train-model'
import { loadScoringModel } from '@/lib/ai/predictive-scoring'

export async function GET(req) {
  try {
    const { orgId } = await guardAiRequest(req, { feature: 'ai_scoring' })
    const db = await getDb()
    const model = await loadScoringModel(db, orgId)
    const lastRun = await db.collection('scoring_model_runs')
      .find({ orgId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()

    return NextResponse.json({
      success: true,
      model: model || null,
      lastRun: lastRun[0] || null,
    })
  } catch (error) {
    return aiError(error)
  }
}

export async function POST(req) {
  try {
    const cronSecret = process.env.CRON_SECRET || process.env.AGENT_CRON_SECRET
    const authHeader = req.headers.get('authorization') || ''
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    const db = await getDb()

    if (isCron) {
      const { retrainAllOrgModels } = await import('@/lib/ai/train-model')
      const reports = await retrainAllOrgModels(db)
      return NextResponse.json({ success: true, mode: 'cron', reports })
    }

    const { orgId } = await guardAiRequest(req, { feature: 'ai_scoring' })
    const body = await req.json().catch(() => ({}))
    const result = await trainScoringModel(db, orgId, { windowDays: body.windowDays })
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return aiError(error)
  }
}
