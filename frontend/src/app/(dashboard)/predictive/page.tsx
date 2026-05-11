import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import PredictivePage from '@/components/predictive/PredictivePage';

export const metadata: Metadata = { title: 'Predictive Engine' };

export default function PredictiveRoutePage() {
  return (
    <PageWrapper>
      <PredictivePage />
    </PageWrapper>
  );
}
