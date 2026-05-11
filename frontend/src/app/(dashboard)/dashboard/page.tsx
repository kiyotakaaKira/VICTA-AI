import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import ForensicDashboard from '@/components/dashboard/ForensicDashboard';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { AIAssistantButton } from '@/components/ai/AIAssistantButton';
import TelemetryFeed from '@/components/TelemetryFeed';
import AuditLog from '@/components/AuditLog';
import SystemStatusPanel from '@/components/SystemStatusPanel';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <PageWrapper>
      <ForensicDashboard />
      <div className="relative z-10 px-6 pb-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <TelemetryFeed />
          <AuditLog />
        </div>
        <div className="mt-6">
          <SystemStatusPanel />
        </div>
      </div>
      <AIAssistantPanel />
      <AIAssistantButton />
    </PageWrapper>
  );
}
