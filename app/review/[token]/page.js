'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export default function PublicReviewPage() {
  const params = useParams()
  const token = String(params?.token || '')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [context, setContext] = useState(null)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetch(`/api/public/review/${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setContext(json.data)
        else setError(json.message || 'Link not found')
      })
      .catch(() => setError('Failed to load review'))
      .finally(() => setLoading(false))
  }, [token])

  async function submit() {
    if (!rating) {
      setError('Please select a rating')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/public/review/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message || 'Submit failed')
        return
      }
      setDone(true)
    } catch {
      setError('Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">Loading…</div>
  }

  if (!context) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">{error || 'Review link not found'}</div>
  }

  if (context.alreadySubmitted || done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4 text-center">
            <h1 className="text-xl font-semibold">Thank you!</h1>
            <p className="text-sm text-muted-foreground">Your feedback has been recorded.</p>
            {context.reviewUrl ? (
              <Button asChild>
                <a href={context.reviewUrl} target="_blank" rel="noopener noreferrer">Leave a public review</a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold">{context.campaignName || 'Rate your experience'}</h1>
            {context.customerName ? <p className="text-sm text-muted-foreground">Hi {context.customerName}</p> : null}
            <p className="text-sm text-muted-foreground mt-2">{context.message}</p>
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star className={`size-8 ${n <= rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            rows={3}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="button" className="w-full" onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit rating'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
