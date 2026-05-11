import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import ForensicTimeline from '@/components/dashboard/ForensicTimeline';

export const metadata: Metadata = { title: 'Timeline' };

export default function TimelinePage() {
  return (
    <PageWrapper>
      <div className="relative z-10 p-6 space-y-6">
        <ForensicTimeline />
      </div>
    </PageWrapper>
  );
}
