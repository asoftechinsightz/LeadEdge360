'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { apiPost } from '@/src/lib/api'
import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OtpSignInPage() {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState('sms')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')

  const sendMutation = useMutation({
    mutationFn: () => apiPost('/auth/login-otp', { phone, channel }),
    onSuccess: (data) => {
      setMessage(data.devOtp ? `OTP sent (dev: ${data.devOtp})` : `OTP sent via ${data.channel || channel}`)
      setStep('verify')
    },
    onError: (e) => setMessage(e.message || 'Failed to send OTP'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => apiPost('/auth/verify-otp', { destination: phone, code: otp, purpose: 'login' }),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      window.location.assign('/splash')
    },
    onError: (e) => setMessage(e.message || 'Invalid OTP'),
  })

  return (
    <AuthShell
      sideTitle="Passwordless sign-in"
      sideSubtitle="Receive a one-time code on SMS or WhatsApp — fast access for field teams and store staff."
      sideBullets={['No password to remember', 'Works on mobile browsers', 'Secure OTP verification', 'Indian mobile numbers supported']}
      title="Sign in with OTP"
      subtitle={step === 'phone' ? 'Enter your registered mobile number' : 'Enter the 6-digit code'}
    >
      {step === 'phone' ? (
        <>
          <div>
            <Label htmlFor="otp-phone" className="text-slate-400 text-xs">Mobile number</Label>
            <Input
              id="otp-phone"
              type="tel"
              inputMode="tel"
              placeholder="9987986207"
              className="mt-1.5 bg-white/5 border-white/10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant={channel === 'sms' ? 'default' : 'outline'} className="flex-1 rounded-full" onClick={() => setChannel('sms')}>SMS</Button>
            <Button type="button" variant={channel === 'whatsapp' ? 'default' : 'outline'} className="flex-1 rounded-full" onClick={() => setChannel('whatsapp')}>WhatsApp</Button>
          </div>
          <Button className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500 mt-4" disabled={sendMutation.isPending} onClick={() => sendMutation.mutate()}>
            {sendMutation.isPending ? 'Sending…' : 'Send OTP'}
          </Button>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="otp-code" className="text-slate-400 text-xs">Verification code</Label>
            <Input
              id="otp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1.5 bg-white/5 border-white/10 tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <Button className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500 mt-4" disabled={verifyMutation.isPending} onClick={() => verifyMutation.mutate()}>
            {verifyMutation.isPending ? 'Verifying…' : 'Verify & sign in'}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-slate-400" onClick={() => { setStep('phone'); setMessage('') }}>
            Change number
          </Button>
        </>
      )}

      {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/signin" className="text-cyan-400 hover:underline">Sign in with password</Link>
      </p>
    </AuthShell>
  )
}
