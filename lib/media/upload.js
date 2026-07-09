import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { scanUploadedBuffer } from './malware-scan'

const MAX_BYTES = 2 * 1024 * 1024
const MAX_DOC_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_DOC_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const EXT_BY_TYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

/**
 * Save an uploaded image to public/uploads/{orgId}/.
 * Returns a public URL path.
 */
export async function saveUploadedImage(orgId, file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'file required'
    throw err
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Only JPEG, PNG, WebP, GIF allowed'
    throw err
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  await scanUploadedBuffer(buffer, { fileName: file.name, mimeType: file.type })
  if (buffer.length > MAX_BYTES) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'File must be under 2MB'
    throw err
  }

  const ext = EXT_BY_TYPE[file.type] || '.bin'
  const safeOrg = String(orgId).replace(/[^a-zA-Z0-9-_]/g, '')
  const dir = path.join(process.cwd(), 'public', 'uploads', safeOrg)
  await mkdir(dir, { recursive: true })

  const filename = `${randomUUID()}${ext}`
  await writeFile(path.join(dir, filename), buffer)

  return `/uploads/${safeOrg}/${filename}`
}

/**
 * Save a lead attachment (images, PDF, doc) to public/uploads/{orgId}/.
 */
export async function saveUploadedDocument(orgId, file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'file required'
    throw err
  }

  if (!ALLOWED_DOC_TYPES.has(file.type)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'Unsupported file type'
    throw err
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const max = file.type.startsWith('image/') ? MAX_BYTES : MAX_DOC_BYTES
  await scanUploadedBuffer(buffer, { fileName: file.name, mimeType: file.type })
  if (buffer.length > max) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = `File must be under ${max / (1024 * 1024)}MB`
    throw err
  }

  const ext = path.extname(file.name || '') || EXT_BY_TYPE[file.type] || '.bin'
  const safeOrg = String(orgId).replace(/[^a-zA-Z0-9-_]/g, '')
  const dir = path.join(process.cwd(), 'public', 'uploads', safeOrg)
  await mkdir(dir, { recursive: true })

  const filename = `${randomUUID()}${ext}`
  await writeFile(path.join(dir, filename), buffer)

  return {
    url: `/uploads/${safeOrg}/${filename}`,
    fileName: file.name || filename,
    mimeType: file.type,
    size: buffer.length,
  }
}
