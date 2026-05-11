'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, MapPin, AlertTriangle, Activity } from 'lucide-react';
import { createAuthenticatedApi } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import supabase from '@/lib/supabase';

export default function BehavioralAnalysis({ caseId, caseData }: { caseId: string, caseData: any }) {
  const { getToken } = useAuth();
  const [comms, setComms] = useState('');
  const [movement, setMovement] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      const { data } = await supabase.from('behavioral_patterns').select('*').eq('case_id', caseId).eq('pattern_type', 'full_behavioral_analysis').order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        setAnalysis(data[0].metadata);
      }
    };
    loadExisting();
  }, [caseId]);

  const handleAnalyze = async () => {
    if (!comms.trim() && !movement.trim()) {
      setError('Please provide communication logs or movement data.');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const api = createAuthenticatedApi(token);
      
      const { data } = await api.post('/api/analyze', {
        action: 'behavioral_analysis',
        case_id: caseId,
        case_title: caseData.title,
        communication_logs: comms,
        movement_data: movement
      });

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze behavioral patterns.');
      }
    } catch (err: any) {
      setError(err.message || 'Error analyzing behavioral patterns.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 font-medium mb-2"><MessageSquare className="w-4 h-4 text-cyan-400" /> Communication Logs</label>
          <textarea 
            value={comms}
            onChange={(e) => setComms(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            rows={5}
            placeholder="Paste communication logs, call records, or message transcripts..."
          />
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 font-medium mb-2"><MapPin className="w-4 h-4 text-cyan-400" /> Movement Data</label>
          <textarea 
            value={movement}
            onChange={(e) => setMovement(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            rows={5}
            placeholder="Paste GPS logs, CCTV location records, or location timeline..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Brain className="w-4 h-4" /> {isAnalyzing ? 'Analyzing...' : 'Analyze Behavioral Patterns'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {isAnalyzing && (
        <div className="border border-gray-700 rounded-xl p-16 flex flex-col items-center justify-center min-h-[300px] bg-gray-900/50">
          <div className="relative w-24 h-24 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const x = 50 + 35 * Math.cos(angle * Math.PI / 180);
                const y = 50 + 35 * Math.sin(angle * Math.PI / 180);
                return (
                  <g key={i}>
                    <line x1="50" y1="50" x2={x} y2={y} stroke="#0891b2" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx={x} cy={y} r="4" fill="#22d3ee" className="neural-node" style={{ animationDelay: `${i * 0.2}s` }} />
                  </g>
                );
              })}
              <circle cx="50" cy="50" r="6" fill="#06b6d4" className="neural-node" />
            </svg>
          </div>
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Analyzing behavioral signatures...</p>
        </div>
      )}

      {!isAnalyzing && analysis && (
        <div className="space-y-6">
          <div className="border border-gray-700 bg-gray-900 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Behavioral Profile</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.behavioral_profile}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-700 bg-gray-900 rounded-xl overflow-hidden">
              <div className="bg-gray-800 p-3 border-b border-gray-700">
                <h4 className="text-white text-sm font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-cyan-400" /> Communication Patterns</h4>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-900/50 text-xs text-gray-400 uppercase">
                    <tr><th className="px-4 py-2 font-medium">Pattern</th><th className="px-4 py-2 font-medium">Freq</th><th className="px-4 py-2 font-medium">Significance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {analysis.communication_patterns?.map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-300">{p.pattern}</td>
                        <td className="px-4 py-3 text-gray-400">{p.frequency}</td>
                        <td className="px-4 py-3 text-cyan-400/80">{p.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-gray-700 bg-gray-900 rounded-xl overflow-hidden">
              <div className="bg-gray-800 p-3 border-b border-gray-700">
                <h4 className="text-white text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /> Movement Patterns</h4>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-900/50 text-xs text-gray-400 uppercase">
                    <tr><th className="px-4 py-2 font-medium">Pattern</th><th className="px-4 py-2 font-medium">Freq</th><th className="px-4 py-2 font-medium">Significance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {analysis.movement_patterns?.map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-300">{p.pattern}</td>
                        <td className="px-4 py-3 text-gray-400">{p.frequency}</td>
                        <td className="px-4 py-3 text-cyan-400/80">{p.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-700 bg-gray-900 rounded-xl p-4">
              <h4 className="text-red-400 text-sm font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Deception Indicators</h4>
              <ul className="space-y-2">
                {analysis.deception_indicators?.map((d: string, i: number) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2"><AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> {d}</li>
                ))}
              </ul>
            </div>
            
            <div className="border border-gray-700 bg-gray-900 rounded-xl p-4 md:col-span-2">
              <h4 className="text-amber-400 text-sm font-semibold mb-3">Behavioral Drift</h4>
              <p className="text-gray-400 text-sm">{analysis.behavioral_drift}</p>
            </div>
          </div>

          {analysis.risk_indicators?.length > 0 && (
            <div>
              <h4 className="text-gray-400 text-xs font-mono uppercase mb-3">Risk Indicators</h4>
              <div className="flex flex-wrap gap-3">
                {analysis.risk_indicators.map((r: string, i: number) => (
                  <div key={i} className="px-3 py-2 border border-red-500/30 bg-red-500/10 text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-500/80 text-xs font-mono">{analysis.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
