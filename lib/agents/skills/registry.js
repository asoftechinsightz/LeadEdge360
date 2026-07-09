/**
 * Reusable agent skill modules — agents compose skills instead of duplicating logic.
 */

import { invokeAgentTool } from '@/lib/agents/tools/executor'

export const SKILL_REGISTRY = {
  lead_analysis: {
    id: 'lead_analysis',
    name: 'Lead Analysis',
    description: 'Analyze lead quality, score, and next actions.',
    tools: ['lead_search', 'crm_search'],
  },
  opportunity_analysis: {
    id: 'opportunity_analysis',
    name: 'Opportunity Analysis',
    description: 'Evaluate pipeline stage, value, and win probability.',
    tools: ['crm_search', 'report_generator'],
  },
  revenue_forecasting: {
    id: 'revenue_forecasting',
    name: 'Revenue Forecasting',
    description: 'Forecast revenue from pipeline and historical data.',
    tools: ['report_generator'],
  },
  customer_segmentation: {
    id: 'customer_segmentation',
    name: 'Customer Segmentation',
    description: 'Segment customers by value, engagement, and risk.',
    tools: ['customer_lookup', 'crm_search'],
  },
  proposal_writing: {
    id: 'proposal_writing',
    name: 'Proposal Writing',
    description: 'Draft proposals from opportunity context.',
    tools: ['proposal_generator', 'customer_lookup'],
  },
  risk_analysis: {
    id: 'risk_analysis',
    name: 'Risk Analysis',
    description: 'Assess deal and customer risk factors.',
    tools: ['customer_lookup', 'report_generator'],
  },
  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze customer sentiment from interactions.',
    tools: ['knowledge_base', 'customer_lookup'],
  },
  territory_planning: {
    id: 'territory_planning',
    name: 'Territory Planning',
    description: 'Plan territory coverage and lead distribution.',
    tools: ['geo_lead_finder', 'lead_search'],
  },
  document_extraction: {
    id: 'document_extraction',
    name: 'Document Extraction',
    description: 'Extract entities from uploaded documents.',
    tools: ['document_search'],
  },
  compliance_validation: {
    id: 'compliance_validation',
    name: 'Compliance Validation',
    description: 'Validate actions against compliance rules.',
    tools: ['knowledge_base'],
  },
}

export function getSkill(skillId) {
  return SKILL_REGISTRY[skillId] || null
}

export function listSkills() {
  return Object.values(SKILL_REGISTRY)
}

/**
 * Run a skill — invokes underlying approved tools.
 */
export async function runSkill(db, {
  orgId,
  agentId,
  skillId,
  params = {},
  taskId = null,
}) {
  const skill = getSkill(skillId)
  if (!skill) throw new Error(`Unknown skill: ${skillId}`)

  const toolResults = {}
  for (const toolId of skill.tools) {
    try {
      toolResults[toolId] = await invokeAgentTool(db, {
        orgId,
        agentId,
        toolId,
        params,
        taskId,
      })
    } catch (err) {
      toolResults[toolId] = { error: err.message }
    }
  }

  return {
    skillId,
    skillName: skill.name,
    toolResults,
    summary: `${skill.name} completed`,
  }
}
