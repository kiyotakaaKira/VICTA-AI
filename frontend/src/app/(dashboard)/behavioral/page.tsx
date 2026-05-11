import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import BehavioralPage from '@/components/behavioral/BehavioralPage';

export const metadata: Metadata = { title: 'Behavioral Patterns' };

export default function BehavioralRoutePage() {
  return (
    <PageWrapper>
      <BehavioralPage />
    </PageWrapper>
  );
}
