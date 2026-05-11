import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ToxicologyModeler } from '@/components/toxicology/ToxicologyModeler';

export const metadata: Metadata = { title: 'Toxicology' };

export default function ToxicologyPage() {
  return (
    <PageWrapper>
      <div className="relative z-10 p-6">
        <ToxicologyModeler />
      </div>
    </PageWrapper>
  );
}
