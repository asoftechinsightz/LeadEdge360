import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WorkspacePlaceholder({ title, description, legacyHref, legacyLabel }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-8 text-center">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {legacyHref && (
        <Button asChild className="rounded-full">
          <Link href={legacyHref}>Open {legacyLabel}</Link>
        </Button>
      )}
    </div>
  )
}
