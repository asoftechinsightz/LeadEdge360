'use client';

import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const FEATURE_LABELS: Record<string, string> = {
  business_card: 'Business Card',
  qr_engine: 'QR Engine',
  reviews: 'Reviews',
  whatsapp_pro: 'WhatsApp Pro',
  ai_assistant: 'AI Assistant',
  retail_inventory: 'Retail Inventory',
};

type Props = {
  feature: string;
  children: ReactNode;
};

export function GrowthFeatureGate({ feature, children }: Props) {
  const { isLoading, isError, enabled } = useFeatureFlag(feature);
  const label = FEATURE_LABELS[feature] || feature;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground p-6">Loading…</p>;
  }

  if (isError || !enabled) {
    return (
      <Card className="m-6 bg-card/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">Upgrade required</h2>
          <p className="text-sm text-muted-foreground">
            {label} is not included in your current plan. Upgrade to Business Growth or higher to unlock this module.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">View billing</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

/** @deprecated Import from hooks/useFeatureFlag */
export { useOrgFeatures } from '@/hooks/useFeatureFlag';
