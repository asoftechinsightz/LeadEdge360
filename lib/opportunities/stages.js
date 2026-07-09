export const STAGES = {
  NEW: 10,
  CONTACTED: 25,
  QUALIFIED: 50,
  MEETING_SCHEDULED: 60,
  PROPOSAL_SENT: 75,
  NEGOTIATION: 85,
  WON: 100,
  LOST: 0,
}

export const LEAD_STATUS_TO_STAGE = {
  New: 'NEW',
  Contacted: 'CONTACTED',
  Qualified: 'QUALIFIED',
  Proposal: 'PROPOSAL_SENT',
  Negotiation: 'NEGOTIATION',
  Won: 'WON',
  Lost: 'LOST',
}

export const STAGE_TO_LEAD_STATUS = Object.fromEntries(
  Object.entries(LEAD_STATUS_TO_STAGE).map(([lead, stage]) => [stage, lead])
)

export const PIPELINE_COLUMNS = [
  { key: 'New', stage: 'NEW', probability: STAGES.NEW },
  { key: 'Contacted', stage: 'CONTACTED', probability: STAGES.CONTACTED },
  { key: 'Qualified', stage: 'QUALIFIED', probability: STAGES.QUALIFIED },
  { key: 'Proposal', stage: 'PROPOSAL_SENT', probability: STAGES.PROPOSAL_SENT },
  { key: 'Negotiation', stage: 'NEGOTIATION', probability: STAGES.NEGOTIATION },
  { key: 'Won', stage: 'WON', probability: STAGES.WON },
  { key: 'Lost', stage: 'LOST', probability: STAGES.LOST },
]

export const PIPELINE_STATUSES = PIPELINE_COLUMNS.map((c) => c.key)
