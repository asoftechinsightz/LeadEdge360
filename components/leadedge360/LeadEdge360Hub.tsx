'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, BRAND_NAME } from '@/lib/brand';
import { LEADS_LIST_PATH, LEADS_NEW_URL } from '@/lib/leads/paths';
import { LeadEdgeBrandLogo } from '@/components/brand/ProductBrandLogo';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Button } from '@/components/design-system/core/Button';
import {
  Target, BriefcaseBusiness, Megaphone, Bot, Map, MessageSquare,
  FileBarChart, Sparkles, ArrowRight, MapPin,
} from 'lucide-react';

const product = PRODUCTS.leadedge360;

const quickLinks = [
  { href: '/dashboard', label: 'Executive dashboard', icon: Target, desc: 'KPIs, revenue, pipeline health' },
  { href: LEADS_LIST_PATH, label: 'Leads', icon: Target, desc: 'Capture, score, and manage leads' },
  { href: '/opportunities', label: 'Opportunities', icon: BriefcaseBusiness, desc: 'Pipeline board & stages' },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone, desc: 'Marketing execution' },
  { href: '/leadedge360/command-center', label: 'AI Command Center', icon: Bot, desc: 'AI workspace & automations' },
  { href: '/leadedge360/territories', label: 'Territories', icon: MapPin, desc: 'Regional performance' },
  { href: '/leadedge360/conversations', label: 'Conversations', icon: MessageSquare, desc: 'WhatsApp & engagement' },
  { href: '/leadedge360/reports', label: 'Reports', icon: FileBarChart, desc: 'Analytics & exports' },
];

export function LeadEdge360Hub() {
  return (
    <div className="space-y-10">
      <div className="brand-glass-card brand-gradient-border overflow-hidden">
        <div className="relative p-8 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-royal))]/20 via-transparent to-[hsl(var(--brand-growth))]/15 pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <LeadEdgeBrandLogo href={null} variant="horizontal" onDarkSurface />
              <p className="text-lg text-muted-foreground">{product.tagline}</p>
              <p className="text-sm text-muted-foreground">
                Growth intelligence powered by {BRAND_NAME}. AI scoring, territory mapping,
                campaigns, and revenue acceleration in one workspace.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-[hsl(var(--brand-growth))] hover:bg-[hsl(var(--brand-growth))]/90 text-white">
                  <Link href={LEADS_NEW_URL}>
                    <Sparkles className="size-4 mr-1" /> New lead
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[hsl(var(--brand-growth))]/40">
                  <Link href="/dashboard">
                    Open dashboard <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="shrink-0 hidden md:block">
              <Image
                src={product.logo}
                alt={product.name}
                width={280}
                height={80}
                className="h-20 w-auto object-contain opacity-95"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title="Growth modules"
        description="Everything you need to capture, engage, and convert — from first touch to won revenue."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card variant="glass" className="h-full brand-gradient-border transition hover:opacity-95">
                <CardContent className="p-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-growth))]/15 text-[hsl(var(--brand-growth))] mb-3">
                    <Icon className="size-5" />
                  </div>
                  <div className="font-semibold group-hover:text-[hsl(var(--brand-growth))] transition-colors">
                    {item.label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
