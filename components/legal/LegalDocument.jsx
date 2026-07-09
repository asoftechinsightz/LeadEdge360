import SiteShell from '@/components/site/SiteShell'
import { LEGAL_META } from '@/lib/legal-content'

export default function LegalDocument({ doc }) {
  return (
    <SiteShell>
      <article className="container max-w-3xl py-16 lg:py-24">
        <header className="mb-10 border-b border-border pb-8">
          <p className="text-sm text-muted-foreground mb-2">Legal · Last updated {LEGAL_META.lastUpdated}</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">{doc.title}</h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            {LEGAL_META.company} · Questions:{' '}
            <a href={`mailto:${LEGAL_META.email}`} className="text-[hsl(var(--brand-electric))] hover:underline">
              {LEGAL_META.email}
            </a>
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-8">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-foreground mb-3">{section.heading}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  )
}
