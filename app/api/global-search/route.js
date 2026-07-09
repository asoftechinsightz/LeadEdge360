export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { applyActiveLeadFilter } from '@/lib/leads/service'
import { leadDetailPath } from '@/lib/leads/paths'

function rx(q) {
  return new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

export async function GET(req) {
  try {
    const { orgId } = await guardCrmRequest(req)
    const db = await getDb()
    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    if (q.length < 2) {
      return NextResponse.json({ success: true, results: [] })
    }

    const pattern = rx(q)
    const leadFilter = applyActiveLeadFilter({
      orgId,
      $or: [
        { name: pattern },
        { company: pattern },
        { email: pattern },
        { phone: pattern },
        { territory: pattern },
      ],
    })

    const [leads, opportunities, proposals, campaigns] = await Promise.all([
      db.collection('leads').find(leadFilter, { projection: { _id: 0, id: 1, name: 1, company: 1, email: 1, status: 1 } }).limit(8).toArray(),
      db.collection('opportunities').find({ orgId, $or: [{ name: pattern }, { company: pattern }] }, { projection: { _id: 0, id: 1, name: 1, company: 1, stage: 1 } }).limit(5).toArray(),
      db.collection('proposals').find({ orgId, $or: [{ clientName: pattern }, { company: pattern }, { proposalNumber: pattern }] }, { projection: { _id: 0, id: 1, proposalNumber: 1, clientName: 1, company: 1, status: 1 } }).limit(5).toArray(),
      db.collection('campaigns').find({ orgId, name: pattern }, { projection: { _id: 0, id: 1, name: 1, status: 1, channel: 1 } }).limit(5).toArray(),
    ])

    const results = [
      ...leads.map((row) => ({ type: 'lead', id: row.id, title: row.name, subtitle: [row.company, row.email, row.status].filter(Boolean).join(' · '), href: leadDetailPath(row.id) })),
      ...opportunities.map((row) => ({ type: 'opportunity', id: row.id, title: row.name || row.company, subtitle: row.stage || 'Opportunity', href: '/opportunities' })),
      ...proposals.map((row) => ({ type: 'proposal', id: row.id || row.proposalNumber, title: row.proposalNumber || row.clientName, subtitle: [row.company, row.status].filter(Boolean).join(' · '), href: row.id ? `/proposals/${row.id}` : '/proposals' })),
      ...campaigns.map((row) => ({ type: 'campaign', id: row.id, title: row.name, subtitle: [row.channel, row.status].filter(Boolean).join(' · '), href: '/campaigns' })),
    ]

    return NextResponse.json({ success: true, results, count: results.length })
  } catch (error) {
    return crmError(error)
  }
}
