import { redirect } from 'next/navigation'
import { leadDetailPath } from '@/lib/leads/paths'

/** Legacy /leads/:id → canonical LeadEdge360 detail route. */
export default function LegacyLeadDetailPage({ params }) {
  redirect(leadDetailPath(params.id))
}
