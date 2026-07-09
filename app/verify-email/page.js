import VerifyEmailClient from './VerifyEmailClient'

export const dynamic = 'force-dynamic'

function queryValue(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

export default function VerifyEmailPage({ searchParams }) {
  const token = queryValue(searchParams?.token)
  return <VerifyEmailClient token={token} />
}
