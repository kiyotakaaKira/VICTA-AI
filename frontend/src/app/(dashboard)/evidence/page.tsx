import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import EvidenceAnalysisPanel from '@/components/dashboard/EvidenceAnalysisPanel';

export const metadata: Metadata = { title: 'Evidence' };

export default function EvidencePage() {
  return (
    <PageWrapper>
      <div className="relative z-10 p-6 space-y-6">
        <EvidenceAnalysisPanel />
      </div>
    </PageWrapper>
  );
}
