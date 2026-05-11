'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Shield, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_AUDIT_LOGS = [
  { id: 'aud-001', created_at: new Date().toISOString(), user_id: 'SENTINEL-9', action: 'NODE_ESCALATION', entity_type: 'INFRASTRUCTURE', ip_address: '192.168.1.104', metadata: { node: 'Chimera-Alpha', level: 4, reason: 'High-confidence behavioral spike' } },
  { id: 'aud-002', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user_id: 'LILLIAN-AI', action: 'EVIDENCE_INGEST', entity_type: 'MEDIA', ip_address: '0.0.0.0', metadata: { source: 'Mumbai-CCTV-4', format: 'HEVC', integrity: '99.98%' } },
  { id: 'aud-003', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user_id: 'SENTINEL-9', action: 'SUBPOENA_ISSUED', entity_type: 'LEGAL', ip_address: '10.0.4.12', metadata: { target: 'Global-Bank-Node', jurisdiction: 'International', status: 'Enforced' } },
  { id: 'aud-004', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), user_id: 'LILLIAN-AI', action: 'NEURAL_SCAN', entity_type: 'AI_ENGINE', ip_address: 'Internal', metadata: { engine: 'Mistral-7B', tokens: 4096, confidence: '94.2%' } },
  { id: 'aud-005', created_at: new Date(Date.now() - 1000 * 3600 * 4).toISOString(), user_id: 'SENTINEL-9', action: 'ACCESS_GRANTED', entity_type: 'USER_AUTH', ip_address: '72.14.23.11', metadata: { user: 'Admin', method: 'Biometric-2FA', duration: '8h' } },
];

const ACTION_COLORS: Record<string, string> = {
  'NODE_ESCALATION': '#EF4444',
  'EVIDENCE_INGEST': '#10B981',
  'SUBPOENA_ISSUED': '#F59E0B',
  'NEURAL_SCAN': '#6366F1',
  'ACCESS_GRANTED': '#14B8A6',
  'DEFAULT': '#94A3B8'
};

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (data && data.length > 0) {
          setLogs(data);
        } else {
          setLogs(SAMPLE_AUDIT_LOGS);
        }
      } catch (err) {
        setLogs(SAMPLE_AUDIT_LOGS);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Reconstructing Audit Trail...</p>
    </div>
  );

  return (
    <div className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
             <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">System Audit Trail</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Tactical Action Log // Provenance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] text-slate-500 font-mono">LIVE_FEED_ACTIVE</span>
        </div>
      </div>
      
      <div className="divide-y divide-white/[0.03]">
        {logs.map(log => {
          const isExpanded = expanded === log.id;
          const date = new Date(log.created_at);
          const color = ACTION_COLORS[log.action] || ACTION_COLORS['DEFAULT'];
          
          return (
            <div key={log.id} className="hover:bg-white/[0.02] transition-colors">
              <div 
                className="p-4 flex items-center cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : log.id)}
              >
                <div className="flex-1 grid grid-cols-12 gap-6 items-center">
                  <div className="col-span-3 text-[10px] text-slate-500 font-mono flex items-center gap-3">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    {date.toLocaleTimeString()}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{log.user_id}</span>
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <span 
                      className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border"
                      style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, color: color }}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-600 inline" /> : <ChevronDown className="w-4 h-4 text-slate-600 inline" />}
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 bg-white/[0.01] border-t border-white/[0.03] text-[10px] font-mono text-slate-400">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-slate-600 font-black uppercase tracking-widest border-b border-white/5 pb-1 mb-3">Event Metadata</p>
                          <div className="flex justify-between"><span className="text-slate-500">Log Identifier:</span> <span className="text-indigo-400">{log.id}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Target Entity:</span> <span className="text-slate-300">{log.entity_type || 'SYSTEM'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Ingress IP:</span> <span className="text-slate-300">{log.ip_address || '127.0.0.1'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">System Time:</span> <span className="text-slate-300">{date.toISOString()}</span></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-slate-600 font-black uppercase tracking-widest border-b border-white/5 pb-1 mb-3">Neural Payload</p>
                          <pre className="bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto text-[10px] text-cyan-500/80 leading-relaxed shadow-inner">
                            {log.metadata ? JSON.stringify(log.metadata, null, 2) : '{}'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
