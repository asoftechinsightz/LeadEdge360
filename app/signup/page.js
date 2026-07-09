'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { toE164India } from '@/lib/phone'
import AuthShell from '@/components/auth/AuthShell'
import DpdpSignupConsent from '@/components/auth/DpdpSignupConsent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const [step, setStep] = useState('register')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', tenantName: '', otp: '' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyRead, setPrivacyRead] = useState(false)
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [otpMeta, setOtpMeta] = useState({ destination: '', channel: 'sms' })
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [signupPolicy, setSignupPolicy] = useState({ enabled: true, loading: true })

  useEffect(() => {
    apiGet('/auth/signup-policy')
      .then((data) => setSignupPolicy({ ...data, loading: false }))
      .catch(() => setSignupPolicy({ enabled: true, loading: false }))
  }, [])

  const registerMutation = useMutation({
    mutationFn: () => {
      const phone = toE164India(form.phone)
      if (!phone) throw new Error('Enter a valid 10-digit Indian mobile number')
      if (!termsAccepted || !privacyRead || !dataProcessingAccepted) {
        throw new Error('Please accept the Terms, confirm you have read the Privacy Policy, and provide required DPDP consent.')
      }
      return apiPost('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone,
        password: form.password,
        tenantName: form.tenantName.trim(),
        dpdpConsent: {
          termsAccepted,
          privacyRead,
          dataProcessingAccepted,
          marketingConsent,
          registrationMethod: 'email',
        },
      })
    },
    onSuccess: (data) => {
      setIsError(false)
      const channel = data.channel || 'sms'
      const dest = data.otpDestination || (channel === 'email' ? form.email : toE164India(form.phone))
      setOtpMeta({ destination: dest, channel })
      setMessage(data.devOtp ? `Verification code (pilot): ${data.devOtp}` : `Code sent to ${dest}`)
      setStep('verify')
    },
    onError: (error) => { setIsError(true); setMessage(error.message || 'Registration failed') },
  })

  const verifyMutation = useMutation({
    mutationFn: () => apiPost('/auth/verify-otp', {
      destination: otpMeta.destination || toE164India(form.phone) || form.email,
      code: form.otp.trim(),
      purpose: 'signup',
    }),
    onSuccess: (data) => {
      setIsError(false)
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        window.location.assign('/splash')
        return
      }
      window.location.assign('/signin')
    },
    onError: (error) => { setIsError(true); setMessage(error.message || 'Verification failed') },
  })

  return (
    <AuthShell
      sideTitle="Create your workspace"
      sideSubtitle="Start with RetailEdge360 or LeadEdge360. Instant digital delivery — your tenant is provisioned in the cloud."
      sideBullets={['DPDP Act 2023 compliant onboarding', 'GST-compliant billing via Razorpay', 'Indian data residency options', 'Onboarding support included']}
      title={step === 'register' ? 'Create workspace' : 'Verify your account'}
      subtitle={step === 'register' ? 'Set up your organization in minutes' : 'Enter the 6-digit verification code'}
    >
      {!signupPolicy.loading && !signupPolicy.enabled ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm space-y-2">
          <p className="font-medium text-amber-200">Self-service signup is not available</p>
          <p className="text-slate-400">{signupPolicy.reason || 'Contact our team to provision your organization.'}</p>
          <Link href="/contact" className="text-cyan-400 hover:underline text-sm">Contact sales</Link>
        </div>
      ) : step === 'register' ? (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMessage(''); registerMutation.mutate() }}>
          <div>
            <Label htmlFor="signup-fullName" className="text-slate-400 text-xs">Full name</Label>
            <Input id="signup-fullName" className="mt-1.5 bg-white/5 border-white/10" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="signup-tenant" className="text-slate-400 text-xs">Organization name</Label>
            <Input id="signup-tenant" className="mt-1.5 bg-white/5 border-white/10" value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="signup-email" className="text-slate-400 text-xs">Work email</Label>
            <Input id="signup-email" type="email" className="mt-1.5 bg-white/5 border-white/10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="signup-phone" className="text-slate-400 text-xs">Phone (India)</Label>
            <Input id="signup-phone" type="tel" placeholder="9987986207" className="mt-1.5 bg-white/5 border-white/10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="signup-password" className="text-slate-400 text-xs">Password</Label>
            <Input id="signup-password" type="password" className="mt-1.5 bg-white/5 border-white/10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>

          <DpdpSignupConsent
            termsAccepted={termsAccepted}
            onTermsAcceptedChange={setTermsAccepted}
            privacyRead={privacyRead}
            onPrivacyReadChange={setPrivacyRead}
            dataProcessingAccepted={dataProcessingAccepted}
            onDataProcessingChange={setDataProcessingAccepted}
            marketingConsent={marketingConsent}
            onMarketingConsentChange={setMarketingConsent}
          />

          <Button type="submit" className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating…' : 'Create workspace'}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMessage(''); verifyMutation.mutate() }}>
          <p className="text-sm text-slate-400">Code sent to <strong className="text-white">{otpMeta.destination}</strong></p>
          <div>
            <Label htmlFor="signup-otp" className="text-slate-400 text-xs">Verification code</Label>
            <Input id="signup-otp" inputMode="numeric" autoComplete="one-time-code" className="mt-1.5 bg-white/5 border-white/10 tracking-widest" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? 'Verifying…' : 'Verify & continue'}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-slate-400" onClick={() => { setStep('register'); setIsError(false); setMessage('') }}>
            Back
          </Button>
        </form>
      )}

      {message && <p className={`mt-4 text-sm ${isError ? 'text-red-400' : 'text-cyan-300'}`} role="alert">{message}</p>}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link href="/signin" className="text-cyan-400 hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
