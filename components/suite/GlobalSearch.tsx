'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/design-system/core/Input';
import { Badge } from '@/components/design-system/core/Badge';
import { cn } from '@/lib/utils';
import { suiteFetch } from './suite-api';

type SearchResult = {
  type: string;
  id: string;
  title?: string;
  subtitle?: string;
  href: string;
};

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setError('');
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await suiteFetch(`/api/global-search?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }
        setResults(data.results || []);
        setOpen(true);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const goToResult = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search leads, opportunities, proposals…"
          className="pl-9 pr-9"
          aria-label="Global search"
          aria-expanded={open}
          aria-controls="suite-global-search-results"
          role="combobox"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (
        <div
          id="suite-global-search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
        >
          {error ? (
            <div className="px-4 py-3 text-sm text-destructive">{error}</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((row) => (
                <li key={`${row.type}-${row.id}`}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full items-start gap-2 px-4 py-2.5 text-left transition hover:bg-muted"
                    onClick={() => goToResult(row.href)}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium">{row.title || 'Unnamed'}</span>
                      {row.subtitle && (
                        <span className="block text-xs text-muted-foreground truncate">{row.subtitle}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px] capitalize">{row.type}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground" onClick={() => setOpen(false)}>
              Open dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
