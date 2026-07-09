'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { setPortalSession } from '@/lib/portal/client'

export default function PortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Login failed')
      return data
    },
    onSuccess: (data) => {
      setPortalSession(data.accessToken, data.customer)
      window.location.assign('/portal/invoices')
    },
    onError: (err) => setError(err.message || 'Login failed'),
  })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 bg-card/80">
        <CardContent className="space-y-6 p-8">
          <div className="text-center space-y-2">
            <BrandLogo href="/" variant="compact" className="justify-center" />
            <h1 className="text-xl font-semibold">Customer Portal</h1>
            <p className="text-sm text-muted-foreground">View invoices and manage your profile</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button
              className="w-full"
              disabled={loginMutation.isPending}
              onClick={() => loginMutation.mutate()}
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
