import fs from 'fs'
import path from 'path'
import os from 'os'
import { PdfBuilder } from '@/lib/pdf/layout'

function writeExportBuffer(buffer, fileName) {
  const exportDir = path.join(os.tmpdir(), 'exports')
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }
  const filePath = path.join(exportDir, fileName)
  fs.writeFileSync(filePath, buffer)
  const stat = fs.statSync(filePath)
  return {
    filePath,
    fileSize: stat.size,
    totalRows: 0,
  }
}

export async function generateReportPdf({ title, headers, rows, rowMapper, branding }, fileName) {
  const pdf = new PdfBuilder(branding)
  await pdf.init()
  await pdf.drawTenantHeader(title)
  pdf.section('Report summary')
  pdf.drawLine('Total records', String(rows.length))
  pdf.drawLine('Generated', new Date().toLocaleString('en-IN'))
  if (rows.length === 0) {
    pdf.drawWrapped('No data available for this report.', 40, 515, 10)
  } else {
    pdf.section('Details')
    const tableRows = rows.slice(0, 100).map(rowMapper)
    const colWidths = headers.map(() => Math.floor(515 / headers.length))
    pdf.drawTable(headers, tableRows, colWidths)
    if (rows.length > 100) {
      pdf.ensureSpace(24)
      pdf.drawWrapped(`Showing first 100 of ${rows.length} records.`, 40, 515, 9)
    }
  }
  const buffer = await pdf.finish(title)
  const result = writeExportBuffer(buffer, fileName)
  return { ...result, totalRows: rows.length }
}
