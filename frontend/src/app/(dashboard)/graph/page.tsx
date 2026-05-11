import type { Metadata } from 'next';
import { Suspense } from 'react';
import GraphPageClient from './GraphPageClient';

export const metadata: Metadata = { title: 'Knowledge Graph' };

export default function GraphPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm">
          Loading…
        </div>
      }
    >
      <GraphPageClient />
    </Suspense>
  );
}
