'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { apiPost } from '@/src/lib/api'
import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request')
  const [destination, setDestination] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const forgotMutation = useMutation({
    mutationFn: () => apiPost('/auth/forgot-password', { destination }),
    onSuccess: (data) => {
      setMessage(data.devOtp ? `Reset code (dev): ${data.devOtp}` : 'If the account exists, a reset code was sent.')
      setStep('reset')
    },
    onError: (error) => setMessage(error.message || 'Request failed'),
  })

  const resetMutation = useMutation({
    mutationFn: () => apiPost('/auth/reset-password', { destination, code, newPassword }),
    onSuccess: () => window.location.assign('/signin'),
    onError: (error) => setMessage(error.message || 'Reset failed'),
  })

  return (
    <AuthShell
      sideTitle="Account recovery"
      sideSubtitle="Reset your password securely using email or mobile OTP."
      title={step === 'request' ? 'Forgot password?' : 'Set new password'}
      subtitle={step === 'request' ? 'We will send a one-time reset code' : 'Enter the code and your new password'}
    >
      {step === 'request' ? (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMessage(''); forgotMutation.mutate() }}>
          <div>
            <Label className="text-slate-400 text-xs">Email or phone</Label>
            <Input className="mt-1.5 bg-white/5 border-white/10" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500" disabled={forgotMutation.isPending}>
            {forgotMutation.isPending ? 'Sending…' : 'Send reset code'}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setMessage(''); resetMutation.mutate() }}>
          <div>
            <Label className="text-slate-400 text-xs">Reset code</Label>
            <Input className="mt-1.5 bg-white/5 border-white/10 tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div>
            <Label className="text-slate-400 text-xs">New password</Label>
            <Input type="password" className="mt-1.5 bg-white/5 border-white/10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" className="w-full rounded-full bg-cyan-600 hover:bg-cyan-500" disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/signin" className="text-cyan-400 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  )
}
