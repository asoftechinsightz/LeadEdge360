'use client';

import Image from 'next/image';
import {
  Phone,
  Mail,
  MessageCircle,
  Globe,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND_LOGO_SRC } from '@/lib/brand';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function mapsUrl(profile: {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) {
  const parts = [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean);
  if (!parts.length) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}

export type PublicCardData = {
  slug: string;
  profile: {
    businessName: string;
    tagline?: string;
    description?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    logoUrl?: string;
    coverUrl?: string;
  };
  socialLinks?: Record<string, string>;
  theme?: { primaryColor?: string; layout?: string };
};

type Props = {
  card: PublicCardData;
  showBranding?: boolean;
};

async function trackClick(slug: string, channel: string) {
  try {
    await fetch(`/api/public/card/${slug}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    });
  } catch {
    /* non-blocking */
  }
}

export function PublicBusinessCard({ card, showBranding = true }: Props) {
  const { profile } = card;
  const primary = card.theme?.primaryColor || '#FF8A3D';
  const logo = profile.logoUrl || BRAND_LOGO_SRC;
  const wa = digitsOnly(profile.whatsapp || profile.phone || '');
  const mapLink = mapsUrl(profile);

  const actions = [
    profile.phone
      ? { key: 'call', label: 'Call', href: `tel:${profile.phone}`, icon: Phone }
      : null,
    wa
      ? {
          key: 'whatsapp',
          label: 'WhatsApp',
          href: `https://wa.me/${wa}`,
          icon: MessageCircle,
        }
      : null,
    profile.email
      ? { key: 'email', label: 'Email', href: `mailto:${profile.email}`, icon: Mail }
      : null,
    profile.website
      ? {
          key: 'website',
          label: 'Website',
          href: profile.website.startsWith('http') ? profile.website : `https://${profile.website}`,
          icon: Globe,
        }
      : null,
    mapLink
      ? { key: 'maps', label: 'Directions', href: mapLink, icon: MapPin }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    href: string;
    icon: typeof Phone;
  }>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden border-border/60 bg-card/80 shadow-xl backdrop-blur">
          {profile.coverUrl ? (
            <div className="relative h-32 w-full bg-muted">
              <Image src={profile.coverUrl} alt="" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="h-24 w-full" style={{ background: `linear-gradient(135deg, ${primary}, #1e293b)` }} />
          )}

          <CardContent className="relative px-6 pb-8 pt-0">
            <div className="-mt-12 mb-4 flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-card shadow-lg ring-2 ring-primary/20">
                <Image
                  src={logo}
                  alt={profile.businessName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">{profile.businessName}</h1>
              {profile.tagline ? (
                <p className="mt-1 text-sm text-muted-foreground">{profile.tagline}</p>
              ) : null}
            </div>

            {profile.description ? (
              <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
                {profile.description}
              </p>
            ) : null}

            {(profile.address || profile.city) ? (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
              </p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {actions.map((action) => (
                <Button
                  key={action.key}
                  asChild
                  className="w-full justify-start gap-2"
                  style={action.key === 'call' ? { backgroundColor: primary } : undefined}
                >
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(card.slug, action.key)}
                  >
                    <action.icon className="size-4 shrink-0" />
                    {action.label}
                    <ExternalLink className="ml-auto size-3 opacity-60" />
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {showBranding ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Powered by{' '}
            <a href="/" className="text-primary hover:underline">
              AsoftechInsightz
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
