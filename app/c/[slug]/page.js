import { notFound } from 'next/navigation'
import { getDb } from '@/lib/mongo'
import { getBusinessCardBySlug, recordCardView, toPublicCard } from '@/lib/growth/business-card/service'
import { PublicBusinessCard } from '@/components/growth/PublicBusinessCard'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  try {
    const db = await getDb()
    const card = await getBusinessCardBySlug(db, params.slug)
    if (!card) return { title: 'Business Card' }
    return {
      title: `${card.profile?.businessName || 'Business Card'} | AsoftechInsightz`,
      description: card.profile?.tagline || card.profile?.description || 'Digital business card',
    }
  } catch {
    return { title: 'Business Card' }
  }
}

export default async function PublicCardPage({ params }) {
  let card = null
  try {
    const db = await getDb()
    const doc = await getBusinessCardBySlug(db, params.slug)
    if (doc) {
      await recordCardView(db, params.slug)
      card = toPublicCard(doc)
    }
  } catch {
    card = null
  }

  if (!card) notFound()

  return <PublicBusinessCard card={card} />
}
