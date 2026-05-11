import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import DeepfakePage from '@/components/deepfake/DeepfakePage';

export const metadata: Metadata = { title: 'Deepfake Detection' };

export default function DeepfakeRoutePage() {
  return (
    <PageWrapper>
      <DeepfakePage />
    </PageWrapper>
  );
}
