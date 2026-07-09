'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/src/lib/api'
import AuthShell from '@/components/auth/AuthShell'

export default function GoogleCompleteClient({ code }) {
  const router = useRouter()
  const [message, setMessage] = useState('Completing Google sign-in…')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!code) {
      setMessage('Missing sign-in code. Return to login and try again.')
      setIsError(true)
      return
    }

    apiPost('/auth/oauth-complete', { code })
      .then((data) => {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        router.replace('/splash')
      })
      .catch((err) => {
        setIsError(true)
        setMessage(err.message || 'Google sign-in failed')
      })
  }, [code, router])

  return (
    <AuthShell
      sideTitle="Secure sign-in"
      sideSubtitle="Completing your Google authentication with enterprise-grade security."
      title="Signing you in"
      subtitle="Please wait while we verify your account"
      footer={null}
    >
      <div className={`text-center text-sm ${isError ? 'text-red-400' : 'text-slate-300'}`} role="status">
        {message}
      </div>
    </AuthShell>
  )
}
