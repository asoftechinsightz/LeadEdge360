'use client';

import { useSearchParams } from 'next/navigation';
import { DesignSystemPreview } from '@/components/design-system/DesignSystemPreview';

const VIEWS = ['marketing', 'suite', 'gallery', 'mobile'];

export default function DesignSystemPreviewClient() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view') || 'gallery';
  const view = VIEWS.includes(viewParam) ? viewParam : 'gallery';

  return (
    <>
      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-background/95 p-1 shadow-lg backdrop-blur text-xs">
        {VIEWS.map((v) => (
          <a
            key={v}
            href={`/design-system-preview?view=${v}`}
            className={
              view === v
                ? 'rounded-full bg-primary px-3 py-2 font-medium text-primary-foreground'
                : 'rounded-full px-3 py-2 text-muted-foreground hover:text-foreground'
            }
          >
            {v}
          </a>
        ))}
      </nav>
      <DesignSystemPreview view={view} />
    </>
  );
}
