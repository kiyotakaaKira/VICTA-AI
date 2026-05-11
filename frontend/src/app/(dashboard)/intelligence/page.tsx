import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import IntelligenceFeedPage from '@/components/intelligence/IntelligenceFeedPage';

export const metadata: Metadata = { title: 'AI Intelligence Feed' };

export default function IntelligencePage() {
  return (
    <PageWrapper>
      <IntelligenceFeedPage />
    </PageWrapper>
  );
}
