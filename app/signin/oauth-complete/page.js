import GoogleCompleteClient from '../google-complete/GoogleCompleteClient'

export const dynamic = 'force-dynamic'

function queryValue(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

/** Shared OAuth completion page (Google + Microsoft). */
export default function OAuthCompletePage({ searchParams }) {
  const code = queryValue(searchParams?.code)
  return <GoogleCompleteClient code={code} />
}
