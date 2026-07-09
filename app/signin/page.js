'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { resolveReturnUrl } from '@/components/suite/auth-routes'
import { apiGet, apiPost } from '@/src/lib/api'
import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { COMPANY } from '@/lib/marketing-content'
import { Shield } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export default function SignIn() {
  const [message, setMessage] = useState('')
  const [ssoInfo, setSsoInfo] = useState(null)
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const emailValue = form.watch('email')

  useEffect(() => {
    const email = String(emailValue || '').trim()
    if (!email.includes('@') || email.length < 5) {
      setSsoInfo(null)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiGet(`/auth/sso/discover?email=${encodeURIComponent(email)}`)
        setSsoInfo(res?.sso || null)
      } catch {
        setSsoInfo(null)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [emailValue])

  const providersQuery = useQuery({
    queryKey: ['auth', 'providers'],
    queryFn: () => apiGet('/auth/providers'),
    staleTime: 60_000,
  })

  const microsoftEnabled = providersQuery.data?.microsoft === true

  function redirectAfterLogin() {
    const destination = resolveReturnUrl(window.location.search, '/splash')
    window.location.assign(destination)
  }

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => apiPost('/auth/login-password', { email, password }),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      redirectAfterLogin()
    },
    onError: (error) => setMessage(error.message || 'Login failed'),
  })

  return (
    <AuthShell
      sideTitle="Your Business Suite workspace"
      sideSubtitle={`Sign in to ${COMPANY.name} — RetailEdge360, LeadEdge360, and unified CRM & retail operations.`}
      sideBullets={[
        'AI lead scoring & sales pipeline',
        'GST billing, POS & inventory',
        'Secure multi-tenant cloud platform',
        'OTP, Google, and Microsoft sign-in',
      ]}
      title="Welcome back"
      subtitle="Sign in with your work email"
    >
      <form onSubmit={form.handleSubmit((v) => { setMessage(''); loginMutation.mutate(v) })} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-slate-400 text-xs">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5 bg-white/5 border-white/10" placeholder="you@company.com" {...form.register('email')} />
          {form.formState.errors.email && <p className="text-xs text-red-400 mt-1">{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password" className="text-slate-400 text-xs">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" className="mt-1.5 bg-white/5 border-white/10" {...form.register('password')} />
          {form.formState.errors.password && <p className="text-xs text-red-400 mt-1">{form.formState.errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="rememberMe" checked={!!form.watch('rememberMe')} onCheckedChange={(v) => form.setValue('rememberMe', !!v)} />
            <Label htmlFor="rememberMe" className="text-sm text-slate-400">Remember me</Label>
          </div>
          <Link href="/forgot-password" className="text-xs text-cyan-400 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator className="bg-white/10" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d1528] px-3 text-[10px] uppercase tracking-wider text-slate-500">or</span>
      </div>

      <div className="space-y-3">
        {ssoInfo?.loginUrl && (
          <Button
            type="button"
            className="w-full rounded-full bg-indigo-600 hover:bg-indigo-500 gap-2"
            onClick={() => { window.location.href = ssoInfo.loginUrl }}
          >
            <Shield className="h-4 w-4" />
            Sign in with {ssoInfo.orgName} SSO
          </Button>
        )}
        <Button type="button" variant="outline" className="w-full rounded-full border-white/15 bg-white/5 hover:bg-white/10" onClick={() => { window.location.href = '/api/auth/google' }}>
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-white/15 bg-white/5 hover:bg-white/10"
          disabled={!microsoftEnabled}
          onClick={() => { window.location.href = '/api/auth/microsoft' }}
          title={microsoftEnabled ? 'Sign in with Microsoft' : 'Microsoft sign-in not configured'}
        >
          Continue with Microsoft
        </Button>
        <Button asChild variant="ghost" className="w-full rounded-full text-cyan-400 hover:text-cyan-300">
          <Link href="/signin/otp">Sign in with OTP (SMS / WhatsApp)</Link>
        </Button>
      </div>

      {message && <p className="mt-4 text-sm text-red-400" role="alert">{message}</p>}

      <p className="mt-6 text-center text-sm text-slate-500">
        New to {COMPANY.name}?{' '}
        <Link href="/signup" className="text-cyan-400 hover:underline">Create workspace</Link>
      </p>
    </AuthShell>
  )
}
