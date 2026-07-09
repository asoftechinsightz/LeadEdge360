import GoogleCompleteClient from './GoogleCompleteClient'

export const dynamic = 'force-dynamic'

function queryValue(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

export default function GoogleCompletePage({ searchParams }) {
  const code = queryValue(searchParams?.code)
  return <GoogleCompleteClient code={code} />
}
