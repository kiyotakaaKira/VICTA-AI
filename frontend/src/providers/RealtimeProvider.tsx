'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { API_BASE } from '@/lib/constants';
import { QK } from '@/lib/queryKeys';

const REFRESH_EVENTS = new Set([
  'TELEMETRY_TICK',
  'DASHBOARD_REFRESH',
  'INTELLIGENCE_FEED',
  'EVIDENCE_ANALYZED',
  'EVIDENCE_UPLOADED',
  'PIPELINE_START',
  'PIPELINE_PHASE',
  'TOXICOLOGY_UPDATE',
  'AUTHENTICITY_SCAN',
  'COLD_CASE_UPDATE',
  'PREDICTION_UPDATE',
  'CITY_THREAT_PULSE',
  'BEHAVIORAL_UPDATE',
  'FEDERATION_PULSE',
  'DEEPFAKE_SCAN',
]);

/**
 * Socket.IO operational bus — invalidates dashboard queries on forensic events.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    const url = API_BASE.replace(/\/$/, '');
    const socket: Socket = io(url, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelayMax: 10000,
    });

    const invalidate = () => {
      qc.invalidateQueries({ queryKey: QK.dashboardStats });
      qc.invalidateQueries({ queryKey: QK.dashboardCharts });
      qc.invalidateQueries({ queryKey: QK.telemetry });
      qc.invalidateQueries({ queryKey: QK.intelligenceFeed });
      qc.invalidateQueries({ queryKey: QK.recentInsights });
      qc.invalidateQueries({ queryKey: QK.analyticsOverview });
      qc.invalidateQueries({ queryKey: ['cases'] });
      qc.invalidateQueries({ queryKey: ['graph'] });
    };

    REFRESH_EVENTS.forEach((ev) => {
      socket.on(ev, () => {
        invalidate();
      });
    });

    socket.on('connect', () => {
      invalidate();
    });

    return () => {
      socket.removeAllListeners();
      socket.close();
    };
  }, [qc]);

  return <>{children}</>;
}
