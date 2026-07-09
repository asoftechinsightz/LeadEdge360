'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { apiGet, apiPost } from '@/src/lib/api';
import { USE_MOCK_API } from '@/src/services/api/config';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppTemplateComposer } from '@/components/leadedge360/WhatsAppTemplateComposer';

type Thread = {
  id: string;
  contact: string;
  channel: string;
  preview: string;
  time: string;
  unread: boolean;
};

type Message = {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  createdAt: string;
};

export function Conversations() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const threadsQuery = useQuery({
    queryKey: ['leadedge360', 'conversations'],
    queryFn: () => leadEdgeApi.conversations(),
  });

  const messagesQuery = useQuery({
    queryKey: ['whatsapp', 'messages', selectedId],
    queryFn: () => apiGet(`/whatsapp/threads/${selectedId}/messages`),
    enabled: Boolean(selectedId) && !USE_MOCK_API,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      apiPost(`/whatsapp/threads/${selectedId}/messages`, { text }),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['leadedge360', 'conversations'] });
      toast.success('Message sent');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Failed to send message');
    },
  });

  if (threadsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Conversations" description="Unified inbox across all channels" />
        <LoadingState label="Loading conversations…" rows={6} />
      </div>
    );
  }

  const threads: Thread[] = threadsQuery.data || [];
  const messages: Message[] = messagesQuery.data?.messages || [];
  const selected = threads.find((t) => t.id === selectedId);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (!selectedId) {
      toast.error('Select a conversation first');
      return;
    }
    if (USE_MOCK_API) {
      toast.success('Message queued (demo)');
      setDraft('');
      return;
    }
    sendMutation.mutate(text);
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Conversations"
        description="WhatsApp inbox — send and track customer threads."
      />

      {USE_MOCK_API ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Demo mode: set <code className="text-xs">NEXT_PUBLIC_USE_MOCK_API=false</code> to load live WhatsApp threads.
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6 min-h-[480px]">
        <Card className="bg-card/60 border-border/60 lg:col-span-1">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/60">
              <p className="font-semibold text-sm">Inbox</p>
              <p className="text-xs text-muted-foreground">{threads.filter((t) => t.unread).length} unread</p>
            </div>
            {threads.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <MessageSquare className="size-10 mx-auto mb-3 opacity-30" />
                <p>No WhatsApp threads yet.</p>
                <p className="text-xs mt-1">Threads appear when customers message or you send from a lead.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
                {threads.map((thread) => (
                  <li
                    key={thread.id}
                    onClick={() => setSelectedId(thread.id)}
                    className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${
                      selectedId === thread.id ? 'bg-primary/10' : thread.unread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="size-4 shrink-0 mt-0.5 text-emerald-400" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${thread.unread ? 'font-semibold' : ''}`}>{thread.contact}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{thread.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.preview || 'No messages'}</p>
                        <Badge variant="outline" className="text-[9px] mt-1 capitalize">whatsapp</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60 lg:col-span-2 flex flex-col">
          <CardContent className="p-5 flex flex-col flex-1 min-h-[420px]">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageSquare className="size-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Select a conversation to view messages</p>
                </div>
              </div>
            ) : (
              <>
                <div className="pb-3 border-b border-border/40 mb-3">
                  <p className="font-semibold">{selected.contact}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp thread</p>
                </div>
                <WhatsAppTemplateComposer
                  threadId={selectedId}
                  onSent={() => {
                    queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', selectedId] });
                    queryClient.invalidateQueries({ queryKey: ['leadedge360', 'conversations'] });
                  }}
                />
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messagesQuery.isLoading ? (
                    <LoadingState label="Loading messages…" rows={3} />
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No messages in this thread yet.</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          msg.direction === 'outbound'
                            ? 'ml-auto bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.body}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            <div className="flex gap-2 pt-4 border-t border-border/40 mt-auto">
              <input
                className="flex-1 rounded-lg border border-border/60 bg-background px-4 py-2 text-sm"
                placeholder={selected ? 'Type a message…' : 'Select a thread…'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={!selected || sendMutation.isPending}
              />
              <Button onClick={handleSend} disabled={!selected || sendMutation.isPending}>
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
