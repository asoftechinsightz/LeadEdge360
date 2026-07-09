import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import os from 'os'

import { generateLeadCsv, readExportFile } from '../lib/csv-export.js'

describe('reports export (integration)', () => {
  const fileName = `test_leads_${Date.now()}.csv`

  before(async () => {
    await generateLeadCsv(
      [{ name: 'A', phone: '1', email: 'a@b.com', company: 'Co', source: 'web', territory: 'IN', status: 'NEW', assignedTo: '', score: 10, createdAt: '2026-01-01' }],
      fileName,
    )
  })

  after(() => {
    const filePath = path.join(os.tmpdir(), 'exports', fileName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  })

  it('writes CSV export files to tmp storage', async () => {
    const file = readExportFile(fileName)
    assert.ok(file)
    assert.ok(file.buffer.length > 20)
    assert.match(file.buffer.toString('utf8'), /Lead Name/)
  })

  it('returns null for missing export files', () => {
    assert.equal(readExportFile('missing_file.csv'), null)
  })
})
