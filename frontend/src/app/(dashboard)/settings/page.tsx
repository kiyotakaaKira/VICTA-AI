import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import SettingsPage from '@/components/settings/SettingsPage';

export const metadata: Metadata = { title: 'Settings | SENTINEL/9' };

export default function SettingsRoutePage() {
  return (
    <PageWrapper>
      <SettingsPage />
    </PageWrapper>
  );
}
