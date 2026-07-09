'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Download, Loader2, QrCode, Share2 } from 'lucide-react';
import { api, apiGet } from '@/src/lib/api';
import { Button } from '@/components/ui/button';

type Props = {
  cardId: string | null;
  published: boolean;
  businessName?: string;
};

export function BusinessCardQrWidget({ cardId, published, businessName }: Props) {
  const queryClient = useQueryClient();

  const qrQuery = useQuery({
    queryKey: ['qr', 'card', cardId],
    queryFn: () => apiGet('/qr', { targetId: cardId!, type: 'business_card' }),
    enabled: !!cardId && published,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/qr', {
        type: 'business_card',
        targetId: cardId,
        label: businessName ? `${businessName} QR` : 'Business card QR',
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr', 'card', cardId] });
    },
  });

  if (!cardId || !published) {
    return (
      <p className="text-sm text-muted-foreground">
        Publish your business card to generate a trackable QR code.
      </p>
    );
  }

  const existing = qrQuery.data?.items?.[0];

  if (qrQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading QR…</p>;
  }

  if (existing) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-28 w-28 overflow-hidden rounded-lg border bg-white p-2">
          <Image
            src={existing.imageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(existing.scanUrl)}`}
            alt="Business card QR"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">{existing.scanUrl}</p>
          <p className="text-xs text-muted-foreground">
            {existing.stats?.scans ?? 0} scans · {existing.stats?.clicks ?? 0} clicks · {existing.stats?.conversions ?? 0} conversions
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a
                href={existing.imageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(existing.scanUrl)}`}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="size-4" />
                Download PNG
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                if (navigator.share) {
                  await navigator.share({ title: existing.label, url: existing.scanUrl });
                } else if (navigator.clipboard) {
                  await navigator.clipboard.writeText(existing.scanUrl);
                }
              }}
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => createMutation.mutate()}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
      Generate QR for this card
    </Button>
  );
}
