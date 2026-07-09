import { Suspense } from 'react';
import DesignSystemPreviewClient from './PreviewClient';

export const metadata = {
  title: 'Design System Preview — AsoftechInsightz',
  robots: 'noindex',
};

export default function DesignSystemPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8">Loading preview…</div>}>
      <DesignSystemPreviewClient />
    </Suspense>
  );
}
