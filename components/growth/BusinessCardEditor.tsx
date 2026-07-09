'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, ExternalLink, Loader2, Save, Upload } from 'lucide-react';
import { api, apiGet } from '@/src/lib/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BusinessCardQrWidget } from '@/components/growth/BusinessCardQrWidget';

type BusinessCard = {
  id: string;
  slug: string;
  published: boolean;
  profile: {
    businessName: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    whatsapp: string;
    website: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    logoUrl: string;
    coverUrl: string;
  };
  stats?: { views?: number; clicks?: number };
};

const emptyProfile = {
  businessName: '',
  tagline: '',
  description: '',
  phone: '',
  email: '',
  whatsapp: '',
  website: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  logoUrl: '',
  coverUrl: '',
};

export function BusinessCardEditor() {
  const queryClient = useQueryClient();
  const [cardId, setCardId] = useState<string | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const listQuery = useQuery({
    queryKey: ['growth', 'business-card'],
    queryFn: () => apiGet('/growth/business-card'),
  });

  const activeCard: BusinessCard | null = useMemo(() => {
    const items = listQuery.data?.items || [];
    if (cardId) return items.find((c: BusinessCard) => c.id === cardId) || items[0] || null;
    return items[0] || null;
  }, [listQuery.data, cardId]);

  useEffect(() => {
    if (activeCard) {
      setCardId(activeCard.id);
      setProfile({ ...emptyProfile, ...activeCard.profile });
      setSlug(activeCard.slug);
    }
  }, [activeCard?.id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { profile, slug };
      if (cardId) {
        const { data } = await api.patch(`/growth/business-card/${cardId}`, payload);
        return data.data;
      }
      const { data } = await api.post('/growth/business-card', payload);
      return data.data;
    },
    onSuccess: (data) => {
      setCardId(data.id);
      setSlug(data.slug);
      setMessage('Saved successfully');
      queryClient.invalidateQueries({ queryKey: ['growth', 'business-card'] });
    },
    onError: (err: Error) => setMessage(err.message || 'Save failed'),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!cardId) throw new Error('Save the card before publishing');
      const { data } = await api.post(`/growth/business-card/${cardId}/publish`);
      return data.data;
    },
    onSuccess: () => {
      setMessage('Published — share your public link');
      queryClient.invalidateQueries({ queryKey: ['growth', 'business-card'] });
    },
    onError: (err: Error) => setMessage(err.message || 'Publish failed'),
  });

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${slug}` : '';

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setMessage('Link copied to clipboard');
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');
      setProfile((p) => ({ ...p, logoUrl: json.url }));
      setMessage('Logo uploaded');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (listQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading business card…</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Digital Business Card"
        description="Create a shareable mobile-friendly profile with call, WhatsApp, email, and map links."
      />

      {activeCard ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={activeCard.published ? 'default' : 'outline'}>
            {activeCard.published ? 'Published' : 'Draft'}
          </Badge>
          {activeCard.stats?.views != null ? (
            <span className="text-xs text-muted-foreground">{activeCard.stats.views} views</span>
          ) : null}
        </div>
      ) : null}

      <Card className="bg-card/60">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name *</Label>
              <Input
                id="businessName"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                placeholder="Acme Realty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                placeholder="Your growth partner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">About</Label>
            <Textarea
              id="description"
              rows={3}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={profile.whatsapp}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                placeholder="Defaults to phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">PIN code</Label>
              <Input id="pincode" value={profile.pincode} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Public URL slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="acme-realty" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                <label className="cursor-pointer">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Upload logo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadLogo(file);
                    }}
                  />
                </label>
              </Button>
              {profile.logoUrl ? (
                <span className="truncate text-xs text-muted-foreground">{profile.logoUrl}</span>
              ) : null}
            </div>
          </div>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

          {activeCard?.published && cardId ? (
            <div className="space-y-2 border-t border-border/60 pt-6">
              <Label>QR code</Label>
              <BusinessCardQrWidget
                cardId={cardId}
                published={!!activeCard.published}
                businessName={profile.businessName}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !profile.businessName}
            >
              {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending || !cardId}
            >
              Publish
            </Button>
            {activeCard?.published && slug ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="size-4" />
                  Copy link
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    Preview
                  </a>
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
