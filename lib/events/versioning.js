import { getEventSchema } from '@/lib/events/schema-registry'

/** Parse "lead.created.v2" → { baseType: "lead.created", version: 2 } */
export function parseVersionedType(type) {
  const raw = String(type || '')
  const match = raw.match(/^(.+)\.v(\d+)$/)
  if (match) {
    return { baseType: match[1], version: Number(match[2]), versionedType: raw }
  }
  const schema = getEventSchema(raw)
  const version = schema?.version || 1
  return { baseType: raw, version, versionedType: `${raw}.v${version}` }
}

export function toVersionedType(baseType, version = 1) {
  return `${baseType}.v${version}`
}

export function getLatestVersion(baseType) {
  return getEventSchema(baseType)?.version || 1
}

export function normalizeEventType(type) {
  const { baseType, version, versionedType } = parseVersionedType(type)
  return { type: baseType, version, versionedType }
}
