'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { API_BASE } from '@/lib/constants';
import { useWebSocket } from '@/hooks/useWebSocket';

interface HealthPayload {
  status: string;
  database?: string;
  uptime?: number;
  timestamp?: string;
}

export default function SystemStatusPanel() {
  const { lastMessage, isConnected } = useWebSocket();
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    if (lastMessage?.type === 'TELEMETRY_TICK' || lastMessage?.type === 'TELEMETRY_EVENT') {
      setTickCount((c) => c + 1);
    }
  }, [lastMessage]);

  const health = useQuery<HealthPayload>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
      if (!res.ok) throw new Error('health failed');
      return res.json();
    },
    refetchInterval: 8000,
  });

  const dbOk = health.data?.database === 'connected';

  return (
    <GlassCard className="p-6">
      <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">System status</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-slate-500">API</div>
          <div className={health.isError ? 'text-red-400' : 'text-emerald-400'}>
            {health.isError ? 'unreachable' : health.data?.status ?? '…'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Database</div>
          <div className={dbOk ? 'text-emerald-400' : 'text-amber-400'}>{health.data?.database ?? '…'}</div>
        </div>
        <div>
          <div className="text-slate-500">Socket.IO</div>
          <div className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
            {isConnected ? 'connected' : 'disconnected'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Realtime ticks (session)</div>
          <div className="text-slate-200">{tickCount}</div>
        </div>
        <div>
          <div className="text-slate-500">Backend uptime (s)</div>
          <div className="text-slate-300">{health.data?.uptime != null ? Math.floor(health.data.uptime) : '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Last probe</div>
          <div className="text-slate-500 truncate">
            {health.dataUpdatedAt ? new Date(health.dataUpdatedAt).toLocaleTimeString() : '—'}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
