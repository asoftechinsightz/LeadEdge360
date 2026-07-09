import { redirect } from 'next/navigation'
import { leadsListRedirectUrl } from '@/lib/leads/paths'

/** Legacy /leads → canonical list with query preserved (tour=1, new=1, etc.). */
export default function LegacyLeadsPage({ searchParams }) {
  redirect(leadsListRedirectUrl(searchParams))
}
