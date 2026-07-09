import fs from 'fs'
import path from 'path'
import os from 'os'

export async function generateLeadCsv(leads, fileName) {
  const exportDir = path.join(os.tmpdir(), 'exports')

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  const headers = [
    'Lead Name',
    'Phone',
    'Email',
    'Company',
    'Source',
    'Territory',
    'Status',
    'Assigned To',
    'Score',
    'Created At'
  ]

  const rows = leads.map(l => [
    l.name || '',
    l.phone || '',
    l.email || '',
    l.company || '',
    l.source || '',
    l.territory || '',
    l.status || '',
    l.assignedTo || '',
    l.score || 0,
    l.createdAt || ''
  ])

  const csv = [
    headers.join(','),
    ...rows.map(r =>
      r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
    )
  ].join('\n')

  const filePath = path.join(exportDir, fileName)

  fs.writeFileSync(filePath, csv)

  const stat = fs.statSync(filePath)

  return {
    filePath,
    fileSize: stat.size,
    totalRows: rows.length
  }
}

export function readExportFile(fileName) {
  if (!fileName) return null
  const filePath = path.join(os.tmpdir(), 'exports', fileName)
  if (!fs.existsSync(filePath)) return null
  return {
    filePath,
    buffer: fs.readFileSync(filePath),
    fileName,
  }
}
