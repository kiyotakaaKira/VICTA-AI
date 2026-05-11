'use client';

import { useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { useCases } from '@/hooks/useCases';

export default function GraphPageClient() {
  return (
    <PageWrapper>
      <div className="relative z-10 p-6 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 min-h-0">
          <KnowledgeGraph />
        </div>
      </div>
    </PageWrapper>
  );
}
