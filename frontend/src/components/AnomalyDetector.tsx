'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { createAuthenticatedApi } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import supabase from '@/lib/supabase';
import type { AnomalyEvent } from '@/lib/supabase';

export default function AnomalyDetector({ caseId, evidence, timeline }: { caseId: string, evidence: any[], timeline: any[] }) {
  const { getToken } = useAuth();
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    // Load existing on mount
    const loadAnomalies = async () => {
      const { data } = await supabase.from('anomaly_events').select('*').eq('case_id', caseId).order('created_at', { ascending: false });
      if (data) {
        setAnomalies(data);
        if (data.length > 0) {
          // Calculate an average score for display if not stored
          setOverallScore(Math.round(data.reduce((acc, curr) => acc + curr.confidence, 0) / data.length));
        }
      }
    };
    loadAnomalies();

    // Realtime subscription
    const channel = supabase
      .channel('anomalies-' + caseId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'anomaly_events',
        filter: 'case_id=eq.' + caseId
      }, (payload) => {
        setAnomalies(prev => [payload.new as AnomalyEvent, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [caseId]);

  const runScan = async () => {
    setIsScanning(true);
    setError('');
    
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const api = createAuthenticatedApi(token);
      
      const { data } = await api.post('/api/analyze', {
        action: 'detect_anomalies',
        case_id: caseId,
        evidence_summaries: evidence.map((e: any) => e.ai_analysis).filter(Boolean),
        timeline_events: timeline.map((t: any) => t.description),
        evidence_ids: evidence.map((e: any) => e.id)
      });

      if (data.success) {
        if (data.result.overall_suspicion_score) {
          setOverallScore(data.result.overall_suspicion_score);
        }
      } else {
        setError(data.error || 'Scan failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error running anomaly scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const markResolved = async (id: string) => {
    await supabase.from('anomaly_events').update({ resolved: true }).eq('id', id);
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const renderGauge = (score: number) => {
    const radius = 60;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22d3ee';

    return (
      <div className="relative w-36 h-36 flex flex-col items-center justify-center mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} stroke="#1f2937" strokeWidth="12" fill="none" />
          <motion.circle
            cx="70" cy="70" r={radius}
            stroke={color} strokeWidth="12" fill="none" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono font-bold text-3xl" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-500 uppercase">Suspicion Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Radar className="text-cyan-400" /> Anomaly Detection</h2>
          <p className="text-sm text-gray-400">Scan evidence and timelines for inconsistencies.</p>
        </div>
        <button 
          onClick={runScan} 
          disabled={isScanning}
          className="px-4 py-2 bg-gray-800 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isScanning ? 'Scanning...' : 'Run Anomaly Scan'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>}

      {isScanning && (
        <div className="tactical-grid h-64 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Radar className="w-12 h-12 text-cyan-500 mb-4 mx-auto" />
          </motion.div>
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Scanning evidence for anomalies...</p>
        </div>
      )}

      {!isScanning && anomalies.length === 0 && (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-mono">No anomalies detected yet. Run a scan to begin.</p>
        </div>
      )}

      {!isScanning && anomalies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border border-gray-700 bg-gray-900 rounded-xl p-6">
            {renderGauge(overallScore)}
            <div className="text-center">
              <p className="text-sm text-gray-400">The overall suspicion score aggregates detected anomaly severities and confidences.</p>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {anomalies.map(anomaly => (
              <motion.div 
                key={anomaly.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl p-5 ${anomaly.resolved ? 'bg-gray-900/50 border-gray-800 opacity-60' : 'bg-gray-900 border-gray-700 holo-card'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-800 border border-gray-700 text-gray-300 font-mono text-xs rounded">
                      {anomaly.anomaly_type}
                    </span>
                    {!anomaly.resolved && (
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase severity-${anomaly.severity === 'critical' ? 'critical' : anomaly.severity === 'high' ? 'high' : anomaly.severity === 'medium' ? 'medium' : 'low'}`}>
                        {anomaly.severity}
                      </span>
                    )}
                  </div>
                  {!anomaly.resolved && (
                    <button 
                      onClick={() => markResolved(anomaly.id)}
                      className="text-xs flex items-center gap-1 text-gray-500 hover:text-green-400 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Mark Resolved
                    </button>
                  )}
                  {anomaly.resolved && <span className="text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Resolved</span>}
                </div>
                
                <p className={`text-sm mb-4 ${anomaly.resolved ? 'text-gray-500' : 'text-gray-300'}`}>{anomaly.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">AI Confidence</span>
                  <span className="text-xs font-mono text-cyan-400">{anomaly.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${anomaly.confidence}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
