import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import os from 'os'

export async function generateLeadXlsx(leads, fileName) {
  const exportDir = path.join(os.tmpdir(), 'exports')
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Leads')
  sheet.columns = [
    { header: 'Lead Name', key: 'name', width: 24 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Source', key: 'source', width: 14 },
    { header: 'Territory', key: 'territory', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Assigned To', key: 'assignedTo', width: 16 },
    { header: 'Score', key: 'score', width: 8 },
    { header: 'Created At', key: 'createdAt', width: 22 },
  ]

  for (const lead of leads) {
    sheet.addRow({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      company: lead.company || '',
      source: lead.source || '',
      territory: lead.territory || '',
      status: lead.status || '',
      assignedTo: lead.assignedTo || '',
      score: lead.score || 0,
      createdAt: lead.createdAt || '',
    })
  }

  const filePath = path.join(exportDir, fileName)
  await workbook.xlsx.writeFile(filePath)
  const stat = fs.statSync(filePath)

  return {
    filePath,
    fileSize: stat.size,
    totalRows: leads.length,
  }
}
