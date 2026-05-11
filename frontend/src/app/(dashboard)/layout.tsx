import { QueryProvider } from '@/components/providers/QueryProvider';
import { RealtimeProvider } from '@/providers/RealtimeProvider';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <RealtimeProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </RealtimeProvider>
    </QueryProvider>
  );
}
