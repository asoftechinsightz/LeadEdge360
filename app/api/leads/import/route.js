export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getDb } from '@/lib/mongo'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'
import { aiScore } from '@/lib/scoring'
import { guardFeatureSoft, blockedBySoftGate, respondSoftGate } from '@/lib/subscription/gate'

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result.map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
}

function mapRow(headers, values) {
  const row = {}
  headers.forEach((h, i) => {
    row[h] = values[i] || ''
  })
  return row
}

export async function POST(req) {
  try {
    const tenant = await guardCrmRequest(req)
    const { gate } = await guardFeatureSoft(tenant, 'lead_export')
    if (blockedBySoftGate(gate)) {
      return respondSoftGate(gate, NextResponse, { hint: 'CSV import is available on Growth plan and above.' })
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'CSV file required' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((l) => l.trim())
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'CSV must include a header row and at least one lead' }, { status: 400 })
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
    const db = await getDb()
    const { orgId } = tenant
    let imported = 0

    for (const line of lines.slice(1)) {
      const values = parseCsvLine(line)
      const row = mapRow(headers, values)
      const phone = row.phone || row.phone_number || ''
      if (!phone && !row.email) continue

      const lead = {
        name: row.name || row.lead_name || 'Imported Lead',
        email: row.email || '',
        phone,
        company: row.company || '',
        source: row.source || 'manual',
        territory: row.territory || 'Bengaluru',
        budget: Number(row.budget || 0),
        message: row.message || '',
      }

      const sc = await aiScore(lead)
      const doc = {
        id: uuid(),
        orgId,
        ...lead,
        score: sc.score,
        label: sc.label,
        reasons: sc.reasons,
        engine: sc.engine,
        status: 'New',
        assignedTo: 'Sales Team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        importedVia: 'csv',
      }
      await db.collection('leads').insertOne(doc)
      imported++
    }

    return NextResponse.json({ success: true, imported })
  } catch (error) {
    return crmError(error)
  }
}
