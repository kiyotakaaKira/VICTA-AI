import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import ThreatAnalyticsGrid from '@/components/dashboard/ThreatAnalyticsGrid';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <PageWrapper>
      <div className="relative z-10 p-6 space-y-6">
        <ThreatAnalyticsGrid />
      </div>
    </PageWrapper>
  );
}
