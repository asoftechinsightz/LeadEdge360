'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Activity, Archive, Bot, CalendarClock, CheckSquare, FileText, IndianRupee,
  MapPin, Megaphone, MessageSquare, Receipt, Search, Settings, Sparkles,
  Target, Trophy, UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { Input } from '@/components/design-system/core/Input'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { apiGet } from '@/src/lib/api'
import { cn } from '@/lib/utils'

const ICONS = {
  calendar: CalendarClock,
  message: MessageSquare,
  check: CheckSquare,
  activity: Activity,
  user: UserCheck,
  map: MapPin,
  sparkles: Sparkles,
  file: FileText,
  trophy: Trophy,
  receipt: Receipt,
  settings: Settings,
  megaphone: Megaphone,
  payment: IndianRupee,
  bot: Bot,
  target: Target,
  archive: Archive,
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'sales', label: 'Sales' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'finance', label: 'Finance' },
  { id: 'support', label: 'Support' },
  { id: 'ai', label: 'AI' },
  { id: 'system', label: 'System' },
  { id: 'mine', label: 'Mine' },
]

function ActivityIcon({ name, color, className }) {
  const Icon = ICONS[name] || Activity
  return (
    <Icon
      className={cn('size-3.5', className)}
      style={color ? { color } : undefined}
      aria-hidden
    />
  )
}

function ActivityCard({ item, brandColor, isLast }) {
  const href = item.href || item.leadHref
  const content = (
    <>
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border/40 z-10"
        style={{ backgroundColor: brandColor ? `${brandColor}18` : undefined }}
      >
        <ActivityIcon name={item.icon} color={brandColor} className={brandColor ? '' : 'text-primary'} />
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          {item.actorLabel && (
            <Badge variant="outline" className="text-[10px] font-normal">
              {item.actorLabel}
            </Badge>
          )}
          {item.priority && (
            <Badge variant="warning" className="text-[10px] font-normal">{item.priority}</Badge>
          )}
          {item.status && (
            <Badge variant="secondary" className="text-[10px] font-normal">{item.status}</Badge>
          )}
        </div>
        {(item.leadName || item.companyName) && (
          <p className="text-sm text-foreground mt-0.5">
            {item.leadName && <span className="font-medium">{item.leadName}</span>}
            {item.companyName && item.companyName !== '—' && (
              <span className="text-muted-foreground"> · {item.companyName}</span>
            )}
          </p>
        )}
        {item.organizationName && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{item.organizationName}</p>
        )}
        {item.summary && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
        )}
        {(item.proposalNumber || item.invoiceNumber || item.opportunityName) && (
          <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2">
            {item.opportunityName && <span>Opportunity: {item.opportunityName}</span>}
            {item.proposalNumber && <span>Proposal: {item.proposalNumber}</span>}
            {item.invoiceNumber && <span>Invoice: {item.invoiceNumber}</span>}
          </p>
        )}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-1.5" title={item.timestamp}>
          {item.relativeTime || '—'}
          {item.timestamp ? ` · ${item.timestamp}` : ''}
        </p>
      </div>
    </>
  )

  return (
    <li className="flex gap-3 relative">
      {!isLast && (
        <div className="absolute left-4 top-9 bottom-0 w-px bg-border/50" aria-hidden />
      )}
      {href ? (
        <Link href={href} className="flex gap-3 min-w-0 flex-1 rounded-lg hover:bg-muted/30 -mx-1 px-1 transition-colors">
          {content}
        </Link>
      ) : (
        <div className="flex gap-3 min-w-0 flex-1">{content}</div>
      )}
    </li>
  )
}

/**
 * Unified activity feed — filters, search, infinite scroll, tenant branding.
 * @param {{ activities?: Array, limit?: number, compact?: boolean, showControls?: boolean, className?: string }} props
 */
export function RecentActivityFeed({
  activities: staticActivities,
  limit = 8,
  compact = false,
  showControls = false,
  className,
}) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const loadMoreRef = useRef(null)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(t)
  }, [search])

  const useLiveFeed = staticActivities === undefined || showControls

  const feedQuery = useInfiniteQuery({
    queryKey: ['activities', filter, debouncedSearch, compact ? limit : 20],
    enabled: useLiveFeed,
    initialPageParam: null,
    queryFn: ({ pageParam }) => apiGet('/activities', {
      limit: compact ? limit : 20,
      cursor: pageParam || undefined,
      filter,
      search: debouncedSearch || undefined,
      mine: filter === 'mine' ? 'true' : undefined,
    }),
    getNextPageParam: (last) => last?.nextCursor || undefined,
  })

  const liveItems = feedQuery.data?.pages.flatMap((p) => p.activities || []) || []
  const branding = feedQuery.data?.pages[0]?.branding
  const brandColor = branding?.primaryColor
  const items = useLiveFeed ? liveItems : (staticActivities || []).slice(0, limit)
  const isLoading = useLiveFeed && feedQuery.isLoading
  const hasMore = useLiveFeed && !!feedQuery.hasNextPage

  const loadMore = useCallback(() => {
    if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
      feedQuery.fetchNextPage()
    }
  }, [feedQuery])

  useEffect(() => {
    if (!useLiveFeed || compact) return undefined
    const node = loadMoreRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore() },
      { rootMargin: '120px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore, useLiveFeed, compact, items.length])

  if (isLoading) {
    return <LoadingState label="Loading activity…" rows={compact ? 3 : 5} className={className} />
  }

  if (items.length === 0) {
    return (
      <div className={className}>
        {showControls && (
          <FeedControls
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />
        )}
        <EmptyState title="No recent activity" description="CRM actions will appear here." className="py-6" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {(showControls || !compact) && useLiveFeed && (
        <FeedControls
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />
      )}
      <ul className="space-y-0">
        {items.map((item, index) => (
          <ActivityCard
            key={item.id || index}
            item={item}
            brandColor={item.brandingColor || brandColor}
            isLast={index === items.length - 1 && !hasMore}
          />
        ))}
      </ul>
      {hasMore && !compact && (
        <div ref={loadMoreRef} className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={feedQuery.isFetchingNextPage}
          >
            {feedQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

function FeedControls({ filter, setFilter, search, setSearch }) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads, proposals, invoices, agents…"
          className="pl-9 h-9"
          aria-label="Search activities"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            type="button"
            size="sm"
            variant={filter === f.id ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
