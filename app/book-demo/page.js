import { Suspense } from 'react'
import BookDemoClient from './BookDemoClient'

export const metadata = {
  title: 'Book a Demo — AsoftechInsightz',
  description: 'Schedule a personalized demo of LeadEdge360 and RetailEdge360 AI SaaS platforms.',
}

export default function BookDemoPage() {
  return (
    <Suspense fallback={null}>
      <BookDemoClient />
    </Suspense>
  )
}
