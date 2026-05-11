'use client';

import { useSidebarStore } from '@/store/useSidebarStore';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="flex min-h-screen bg-forensic-bg">
      <Sidebar />
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-[60px]">
          {children}
        </main>
      </div>
    </div>
  );
}
