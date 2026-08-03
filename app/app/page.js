import { redirect } from 'next/navigation'

export default function LegacyAppIndex() {
  redirect('/dashboard')
}
