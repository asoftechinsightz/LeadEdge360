'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/design-system/core/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { suiteFetch } from './suite-api';

type NotificationItem = {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  href?: string;
};

export function NotificationBell({ className }: { className?: string }) {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await suiteFetch('/api/notifications');
      if (!response.ok) return;
      const data = await response.json();
      setItems(data.notifications || []);
      setUnread(data.unread ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const interval = window.setInterval(load, 60_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await suiteFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
      setUnread((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {loading && <span className="text-xs font-normal text-muted-foreground">Updating…</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          items.slice(0, 8).map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex cursor-default flex-col items-start gap-1 p-3 focus:bg-muted"
              onSelect={(event) => event.preventDefault()}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn('text-sm font-medium', !item.readAt && 'text-foreground')}>
                    {item.title || 'Notification'}
                  </p>
                  {item.body && <p className="text-xs text-muted-foreground line-clamp-2">{item.body}</p>}
                </div>
                {!item.readAt && (
                  <button
                    type="button"
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label="Mark as read"
                    onClick={() => markRead(item.id)}
                  >
                    <Check className="size-4" />
                  </button>
                )}
              </div>
              {item.href && (
                <Link href={item.href} className="text-xs text-primary hover:underline">
                  View
                </Link>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
