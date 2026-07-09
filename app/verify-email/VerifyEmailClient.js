'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand/BrandLogo'

export default function VerifyEmailClient({ token }) {
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your email…')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }

    apiPost('/auth/verify-email', { token })
      .then(() => {
        setStatus('success')
        setMessage('Your email has been verified. You can sign in now.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Verification failed. The link may have expired.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <BrandLogo href="/" variant="icon" showText className="justify-center" />
          <p className={status === 'error' ? 'text-red-500' : 'text-muted-foreground'}>{message}</p>
          {status !== 'verifying' && (
            <Button asChild className="w-full">
              <Link href="/signin">Go to sign in</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
