'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Download,
  LayoutDashboard,
  List,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  Share2,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { api, apiGet } from '@/src/lib/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type QrItem = {
  id: string;
  code: string;
  type: string;
  label: string;
  targetId: string;
  active: boolean;
  scanUrl: string;
  payload?: Record<string, unknown>;
  stats?: { scans?: number; clicks?: number; conversions?: number };
  imageUrl?: string;
};

type View = 'dashboard' | 'list' | 'create' | 'edit' | 'analytics';

const QR_TYPES = [
  { value: 'business_card', label: 'Business card' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'review', label: 'Review link' },
  { value: 'website', label: 'Website' },
  { value: 'lead_form', label: 'Lead form' },
  { value: 'custom_url', label: 'Custom URL' },
];

function publicQrImage(scanUrl: string, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(scanUrl)}`;
}

async function shareQr(item: QrItem) {
  const shareData = {
    title: item.label,
    text: `Scan my QR code: ${item.label}`,
    url: item.scanUrl,
  };
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share(shareData);
    return;
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(item.scanUrl);
  }
}

export function QrManager() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('dashboard');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('business_card');
  const [label, setLabel] = useState('');
  const [targetId, setTargetId] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [leadPath, setLeadPath] = useState('/contact');
  const [message, setMessage] = useState('');
  const [editItem, setEditItem] = useState<QrItem | null>(null);
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);

  const cardsQuery = useQuery({
    queryKey: ['growth', 'business-card'],
    queryFn: () => apiGet('/growth/business-card'),
  });

  const summaryQuery = useQuery({
    queryKey: ['qr', 'summary'],
    queryFn: () => apiGet('/qr/summary'),
  });

  const qrQuery = useQuery({
    queryKey: ['qr', 'list', page],
    queryFn: () => apiGet('/qr', { page: String(page), pageSize: '12' }),
  });

  const analyticsQuery = useQuery({
    queryKey: ['qr', 'analytics', analyticsId],
    queryFn: () => apiGet(`/qr/${analyticsId}/analytics`),
    enabled: !!analyticsId,
  });

  const cards = (cardsQuery.data?.items || []).filter((c: { published?: boolean }) => c.published);
  const items: QrItem[] = qrQuery.data?.items || [];
  const pagination = qrQuery.data?.pagination;
  const summary = summaryQuery.data?.data;

  const resetForm = () => {
    setLabel('');
    setTargetId('');
    setWhatsappPhone('');
    setUrlValue('');
    setLeadPath('/contact');
    setEditItem(null);
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = { type, label: label || undefined };
    if (type === 'business_card') payload.targetId = targetId;
    else if (type === 'whatsapp') payload.payload = { phone: whatsappPhone };
    else if (type === 'review' || type === 'website' || type === 'custom_url') payload.payload = { url: urlValue };
    else if (type === 'lead_form') payload.payload = { path: leadPath };
    return payload;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/qr', buildPayload());
      return data.data;
    },
    onSuccess: () => {
      setMessage('QR code created');
      resetForm();
      setView('list');
      queryClient.invalidateQueries({ queryKey: ['qr'] });
    },
    onError: (err: Error) => setMessage(err.message || 'Create failed'),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editItem) return null;
      const body: Record<string, unknown> = { label };
      if (type === 'whatsapp') body.payload = { phone: whatsappPhone };
      if (['review', 'website', 'custom_url'].includes(type)) body.payload = { url: urlValue };
      if (type === 'lead_form') body.payload = { path: leadPath };
      const { data } = await api.put(`/qr/${editItem.id}`, body);
      return data.data;
    },
    onSuccess: () => {
      setMessage('QR code updated');
      resetForm();
      setView('list');
      queryClient.invalidateQueries({ queryKey: ['qr'] });
    },
    onError: (err: Error) => setMessage(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/qr/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr'] });
      if (analyticsId) setAnalyticsId(null);
    },
  });

  const startEdit = (item: QrItem) => {
    setEditItem(item);
    setType(item.type);
    setLabel(item.label);
    setTargetId(item.targetId || '');
    setWhatsappPhone(String(item.payload?.phone || ''));
    setUrlValue(String(item.payload?.url || ''));
    setLeadPath(String(item.payload?.path || '/contact'));
    setView('edit');
  };

  const tabs = useMemo(
    () => [
      { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'list' as View, label: 'QR List', icon: List },
      { id: 'create' as View, label: 'Create QR', icon: Plus },
    ],
    [],
  );

  const typeFields = (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType} disabled={view === 'edit'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QR_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Shop counter QR" />
        </div>
      </div>

      {type === 'business_card' ? (
        <div className="space-y-2">
          <Label>Published business card</Label>
          <Select value={targetId} onValueChange={setTargetId} disabled={view === 'edit'}>
            <SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
            <SelectContent>
              {cards.map((c: { id: string; profile?: { businessName?: string }; slug?: string }) => (
                <SelectItem key={c.id} value={c.id}>{c.profile?.businessName || c.slug}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {type === 'whatsapp' ? (
        <div className="space-y-2">
          <Label>WhatsApp number</Label>
          <Input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="+919876543210" />
        </div>
      ) : null}

      {['review', 'website', 'custom_url'].includes(type) ? (
        <div className="space-y-2">
          <Label>Destination URL</Label>
          <Input value={urlValue} onChange={(e) => setUrlValue(e.target.value)} placeholder="https://example.com" />
        </div>
      ) : null}

      {type === 'lead_form' ? (
        <div className="space-y-2">
          <Label>Lead form path</Label>
          <Input value={leadPath} onChange={(e) => setLeadPath(e.target.value)} placeholder="/contact" />
        </div>
      ) : null}
    </>
  );

  const qrCard = (item: QrItem) => (
    <div key={item.id} className="rounded-xl border border-border/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm">{item.label}</p>
          <Badge variant="outline" className="mt-1 capitalize">{item.type.replace(/_/g, ' ')}</Badge>
          {!item.active ? <Badge variant="secondary" className="ml-1">Inactive</Badge> : null}
        </div>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white p-1">
          <Image
            src={item.imageUrl || publicQrImage(item.scanUrl)}
            alt="QR"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground truncate">{item.scanUrl}</p>
      <p className="text-xs text-muted-foreground">
        {item.stats?.scans ?? 0} scans · {item.stats?.clicks ?? 0} clicks · {item.stats?.conversions ?? 0} conversions
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={item.imageUrl || publicQrImage(item.scanUrl, 400)} download={`qr-${item.code}.png`} target="_blank" rel="noopener noreferrer">
            <Download className="size-3" /> Download
          </a>
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => shareQr(item)}>
          <Share2 className="size-3" /> Share
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => { setAnalyticsId(item.id); setView('analytics'); }}>
          <BarChart3 className="size-3" /> Analytics
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(item)}>
          <Pencil className="size-3" /> Edit
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
          <Trash2 className="size-3" /> Delete
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Engine"
        description="Generate trackable QR codes for cards, WhatsApp, reviews, websites, and lead forms."
      />

      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={view === tab.id || (view === 'edit' && tab.id === 'create') || (view === 'analytics' && tab.id === 'list') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => { setView(tab.id); if (tab.id !== 'create') resetForm(); }}
              className={cn('gap-1.5')}
            >
              <Icon className="size-4" />
              {tab.label}
            </Button>
          );
        })}
        {view === 'analytics' ? (
          <Badge variant="outline" className="ml-auto self-center">Analytics view</Badge>
        ) : null}
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      {view === 'dashboard' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total QRs', value: summary?.totals?.totalCodes ?? 0 },
            { label: 'Total scans', value: summary?.totals?.scans ?? 0 },
            { label: 'Total clicks', value: summary?.totals?.clicks ?? 0 },
            { label: 'Conversions', value: summary?.totals?.conversions ?? 0 },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-card/60 md:col-span-2 lg:col-span-4">
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold text-sm">Top performers</h2>
              {(summary?.topPerformers || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No QR codes yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {(summary?.topPerformers || []).map((item: QrItem) => (
                    <li key={item.id} className="flex justify-between gap-2">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.stats?.scans ?? 0} scans</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {view === 'list' ? (
        <Card className="bg-card/60">
          <CardContent className="p-6">
            {qrQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No QR codes yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(qrCard)}</div>
            )}
            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-4 flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
                <Button type="button" variant="outline" size="sm" disabled={!pagination.hasMore} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {view === 'create' || view === 'edit' ? (
        <Card className="bg-card/60">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              {view === 'edit' ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {view === 'edit' ? 'Edit QR code' : 'Create QR code'}
            </h2>
            {typeFields}
            <Button
              type="button"
              onClick={() => (view === 'edit' ? updateMutation.mutate() : createMutation.mutate())}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
              {view === 'edit' ? 'Save changes' : 'Generate QR'}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {view === 'analytics' && analyticsId && analyticsQuery.data?.data ? (
        <Card className="bg-card/60">
          <CardContent className="p-6 space-y-4 text-sm">
            <h2 className="font-semibold">Analytics — {analyticsQuery.data.data.label}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-muted-foreground">Scans</p><p className="text-lg font-medium">{analyticsQuery.data.data.totals?.scans ?? 0}</p></div>
              <div><p className="text-muted-foreground">Unique scans</p><p className="text-lg font-medium">{analyticsQuery.data.data.totals?.uniqueScans ?? 0}</p></div>
              <div><p className="text-muted-foreground">Clicks</p><p className="text-lg font-medium">{analyticsQuery.data.data.totals?.clicks ?? 0}</p></div>
              <div><p className="text-muted-foreground">Conversions</p><p className="text-lg font-medium">{analyticsQuery.data.data.totals?.conversions ?? 0}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><p className="font-medium mb-1">Devices</p><pre className="text-xs bg-muted/40 p-2 rounded overflow-auto">{JSON.stringify(analyticsQuery.data.data.devices || {}, null, 2)}</pre></div>
              <div><p className="font-medium mb-1">Browsers</p><pre className="text-xs bg-muted/40 p-2 rounded overflow-auto">{JSON.stringify(analyticsQuery.data.data.browsers || {}, null, 2)}</pre></div>
              <div><p className="font-medium mb-1">Locations</p><pre className="text-xs bg-muted/40 p-2 rounded overflow-auto">{JSON.stringify(analyticsQuery.data.data.locations || {}, null, 2)}</pre></div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
