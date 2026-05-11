'use client';

import { useState, useEffect, useRef } from 'react';
import supabase from '@/lib/supabase';
import type { TelemetryEvent } from '@/lib/supabase';
import { Activity, Trash2, Filter, AlertCircle, Shield, Cpu, Zap } from 'lucide-react';
import { demoEngine } from '@/lib/demoRealtimeEngine';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function TelemetryFeed({ caseId }: { caseId?: string }) {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [counter, setCounter] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const { isDemoMode } = useWebSocket();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitial = async () => {
      let query = supabase.from('telemetry_events').select('*').order('created_at', { ascending: false }).limit(20);
      if (caseId) query = query.eq('case_id', caseId);
      const { data } = await query;
      if (data) {
        setEvents(data);
        setCounter(data.length);
      }
    };
    loadInitial();

    let channelFilter = {};
    if (caseId) channelFilter = { filter: 'case_id=eq.' + caseId };

    const channel = supabase
      .channel('telemetry-feed' + (caseId ? `-${caseId}` : ''))
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'telemetry_events',
        ...channelFilter
      }, (payload) => {
        setEvents(prev => {
          const updated = [payload.new as TelemetryEvent, ...prev].slice(0, 200);
          return updated;
        });
        setCounter(c => c + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [caseId]);

  // Demo Engine Integration
  useEffect(() => {
    if (!isDemoMode) return;

    const handleTick = (payload: any) => {
      const newEvent: TelemetryEvent = {
        id: Math.random().toString(36).substr(2, 9),
        case_id: caseId || 'DEMO-99',
        event_type: payload.anomaly > 50 ? 'ANOMALY_SPIKE' : 'SIGNAL_TICK',
        severity: payload.anomaly > 80 ? 'critical' : payload.anomaly > 50 ? 'high' : 'info',
        source: payload.signalType,
        payload: { value: payload.value, anomaly: payload.anomaly, unit: payload.unit },
        created_at: new Date().toISOString()
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 100));
      setCounter(c => c + 1);
    };

    const handleIntelligence = (a: any) => {
      const intelEvent: TelemetryEvent = {
        id: a.id,
        case_id: caseId || 'INTEL-XX',
        event_type: 'AI_INSIGHT',
        severity: a.severity as any,
        source: 'CORE_AI',
        payload: { title: a.title, message: a.message },
        created_at: new Date().toISOString()
      };
      setEvents(prev => [intelEvent, ...prev].slice(0, 100));
      setCounter(c => c + 1);
    };

    demoEngine.on('TELEMETRY_TICK', handleTick);
    demoEngine.on('INTELLIGENCE_FEED', handleIntelligence);

    return () => {
      demoEngine.off('TELEMETRY_TICK', handleTick);
      demoEngine.off('INTELLIGENCE_FEED', handleIntelligence);
    };
  }, [isDemoMode, caseId]);

  useEffect(() => {
    // Auto-scroll logic if we want it to stay at the bottom, or just keep new items at top.
    // Given the prompt says "terminal-style scrollable container... auto-scroll to bottom when new event arrives",
    // wait, if new events are added to the TOP (payload.new, ...prev), then we don't auto-scroll to bottom.
    // If they are added to the BOTTOM, we do. I will just leave standard top-down chronological for ease unless forced.
    // The prompt specifically asked to auto-scroll. I'll reverse the array for display if we auto-scroll to bottom.
  }, [events]);

  const displayedEvents = events.filter(e => filter === 'ALL' || e.severity.toUpperCase() === filter);
  
  // Terminal style usually adds to bottom
  const reversedEvents = [...displayedEvents].reverse();

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [reversedEvents.length]);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
          <h3 className="text-white font-bold text-sm tracking-wide">LIVE TELEMETRY STREAM</h3>
          <span className="px-2 py-0.5 bg-gray-800 text-cyan-400 font-mono text-[10px] rounded border border-gray-700">
            {counter} EVENTS
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-800 rounded p-1 gap-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                  filter === f ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setEvents([])}
            className="p-1.5 text-gray-500 hover:text-red-400 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            title="Clear Feed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={feedRef} className="flex-1 overflow-y-auto p-4 terminal-feed bg-black">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-gray-600 cursor-blink">AWAITING TELEMETRY...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {reversedEvents.map(ev => {
              const date = new Date(ev.created_at);
              const time = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
              const isCrit = ev.severity === 'critical';
              const isInsight = ev.event_type === 'AI_INSIGHT';
              
              return (
                <div key={ev.id} className={`flex items-start gap-3 hover:bg-white/5 px-2 py-1.5 rounded-lg border-l-2 transition-all group ${
                  ev.severity === 'critical' ? 'border-red-500 bg-red-500/5' : 
                  ev.severity === 'high' ? 'border-orange-500' : 
                  ev.severity === 'medium' ? 'border-yellow-500' : 'border-cyan-500/30'
                }`}>
                  <div className="flex flex-col items-center gap-1 mt-0.5 min-w-[70px]">
                    <span className="text-[9px] font-mono text-slate-500">[{time}]</span>
                    {isCrit && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-black tracking-widest uppercase ${
                        ev.severity === 'critical' ? 'text-red-400' : 
                        ev.severity === 'high' ? 'text-orange-400' : 
                        ev.severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'
                      }`}>
                        {ev.event_type}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">/</span>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider">{ev.source}</span>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-300 break-words font-mono">
                      {isInsight ? (
                        <>
                          <span className="text-white font-bold">{(ev.payload as any).title}</span>: {(ev.payload as any).message}
                        </>
                      ) : (
                        Object.entries(ev.payload as object).map(([k, v]) => (
                          <span key={k} className="mr-3">
                            <span className="text-slate-500">{k}:</span>
                            <span className="text-slate-200 ml-1">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Signal Strength Indicator */}
                  {!isInsight && (ev.payload as any).value !== undefined && (
                    <div className="hidden sm:flex flex-col items-end gap-1 mt-1 shrink-0">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div 
                            key={i} 
                            className={`w-1 h-3 rounded-full ${
                              i <= Math.ceil((ev.payload as any).value / 20) 
                              ? (ev.severity === 'critical' ? 'bg-red-500' : 'bg-cyan-500') 
                              : 'bg-white/5'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
