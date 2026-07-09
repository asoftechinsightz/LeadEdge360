import { getProposalDetail } from '@/lib/proposals/service'

export async function getProposal(proposalId, orgId) {
  return getProposalDetail(proposalId, orgId)
}
