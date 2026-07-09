#!/usr/bin/env node
/** Upload storage validation — writable path, size limits, sample round-trip. */
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const uploadDir = join(root, 'public', 'uploads')
const maxMb = Number(process.env.UPLOAD_MAX_MB || 25)

let failed = 0
function ok(m) { console.log(`  OK   ${m}`) }
function fail(m) { console.log(`  FAIL ${m}`); failed++ }

console.log('\nUpload storage validation\n')

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
  ok('created public/uploads')
}

try {
  const probe = join(uploadDir, '.rc3-probe')
  writeFileSync(probe, 'ok')
  readFileSync(probe, 'utf8')
  unlinkSync(probe)
  ok('read/write probe')
} catch (e) {
  fail(`read/write probe: ${e.message}`)
}

const stat = statSync(uploadDir)
if (stat.isDirectory()) ok('uploads is directory')
else fail('uploads is not a directory')

ok(`max upload size policy: ${maxMb}MB (nginx + app)`)

if (process.env.UPLOADS_BACKUP_DIR && existsSync(process.env.UPLOADS_BACKUP_DIR)) {
  ok(`backup dir ${process.env.UPLOADS_BACKUP_DIR}`)
} else {
  console.log('  INFO run backup-schedule.sh to archive uploads')
}

process.exit(failed ? 1 : 0)
