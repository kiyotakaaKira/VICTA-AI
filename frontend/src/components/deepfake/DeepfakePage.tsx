'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, CheckCircle, XCircle, AlertCircle, Eye, Cpu, Activity } from 'lucide-react';
import { useDeepfakeScans } from '@/hooks/useDeepfake';
import { formatTimeAgo } from '@/lib/utils';
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell, Tooltip } from 'recharts';

function AuthenticityGauge({ score, verdict }: { score: number; verdict: string }) {
  const color = score >= 75 ? '#22d3ee' : score >= 45 ? '#f59e0b' : '#ef4444';
  const radius = 70;
  const stroke = 7;
  const norm = radius - stroke * 2;
  const circ = norm * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={norm} cx={radius} cy={radius} />
        <motion.circle
          stroke={color} fill="transparent" strokeWidth={stroke}
          strokeDasharray={`${circ} ${circ}`} strokeLinecap="round"
          r={norm} cx={radius} cy={radius}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{score}%</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Authentic</span>
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === 'authentic') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
      <CheckCircle size={12} className="text-cyan-400" />
      <span className="text-xs font-bold text-cyan-400 font-mono">AUTHENTIC</span>
    </div>
  );
  if (verdict === 'manipulated') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
      <XCircle size={12} className="text-red-400" />
      <span className="text-xs font-bold text-red-400 font-mono">MANIPULATED</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <AlertCircle size={12} className="text-amber-400" />
      <span className="text-xs font-bold text-amber-400 font-mono">INCONCLUSIVE</span>
    </div>
  );
}

function ScanCard({ scan, index }: { scan: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border p-5 space-y-4"
      style={{ background: 'rgba(15,22,41,0.7)', borderColor: 'rgba(6,182,212,0.1)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white truncate max-w-[200px]">{scan.file_name || 'Unknown File'}</p>
          <p className="text-xs text-slate-600 font-mono mt-0.5">{formatTimeAgo(scan.created_at)}</p>
        </div>
        <VerdictBadge verdict={scan.verdict ?? 'inconclusive'} />
      </div>

      <div className="flex items-center justify-center">
        <AuthenticityGauge score={scan.authenticity_score ?? 50} verdict={scan.verdict} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'GAN Artifact', value: scan.gan_artifact_score ?? 0, color: '#ef4444' },
          { label: 'Temporal', value: scan.temporal_coherence ?? 100, color: '#22d3ee' },
          { label: 'Manipulation', value: scan.manipulation_probability ?? 0, color: '#f59e0b' },
          { label: 'Confidence', value: scan.confidence ?? 0, color: '#a855f7' },
        ].map(({ label, value, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-slate-600">{label}</span>
              <span className="text-xs font-mono" style={{ color }}>{value}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: color }}
                initial={{ width: 0 }} animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.07 + 0.3 }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DeepfakeScanSimulation() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [scanMode, setScanMode] = useState<'VIDEO' | 'DOCUMENT' | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUploadClick = (mode: 'VIDEO' | 'DOCUMENT') => {
    setScanMode(mode);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsScanning(true);
    setResult(null);
    setFileContent('');

    // If document, try to read a snippet
    if (file.type.includes('text') || file.name.endsWith('.pdf') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text.substring(0, 500) + '...');
      };
      reader.readAsText(file);
    }

    // Simulate Upload & Scan Progress
    let p = 0;
    const int = setInterval(() => {
      p += Math.random() * 8;
      if (p >= 100) {
        p = 100;
        clearInterval(int);
        
        // Finalize
        setTimeout(() => {
          setIsScanning(false);
          setResult({
            score: Math.random() > 0.6 ? Math.round(85 + Math.random() * 10) : Math.round(15 + Math.random() * 20),
            verdict: Math.random() > 0.6 ? 'authentic' : 'manipulated',
            gan: Math.round(Math.random() * 40),
            temporal: Math.round(70 + Math.random() * 30),
            metadata: 94,
            pixel: file.type.includes('video') ? 82 : 98,
            semantic: 89,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          });
        }, 800);
      }
      setProgress(p);
    }, 150);

    // Actual Backend Upload (Background)
    const formData = new FormData();
    formData.append('file', file);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analysis/upload`, {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-8 relative overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={scanMode === 'VIDEO' ? 'video/*' : '.pdf,.txt,.doc,.docx'}
        onChange={handleFileChange}
      />

      {/* Scanning Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/10 overflow-hidden">
         {isScanning && <motion.div className="h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Scan className={`w-5 h-5 ${isScanning ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Media Ingestion</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Multi-Modal Scan</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onUploadClick('VIDEO')}
            disabled={isScanning}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
          >
            <Activity size={14} className="text-cyan-400" />
            Upload Video
          </button>
          <button 
            onClick={() => onUploadClick('DOCUMENT')}
            disabled={isScanning}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Cpu size={14} />
            Upload Document
          </button>
        </div>
      </div>

      {!isScanning && !result && (
        <div className="h-64 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-6 bg-white/[0.02] group hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => onUploadClick('VIDEO')}>
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Activity size={32} className="text-slate-700" />
           </div>
           <div className="text-center">
             <p className="text-xs text-white font-black uppercase tracking-widest mb-1">Drag & Drop Forensic Segment</p>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Awaiting neural forensic injection...</p>
           </div>
        </div>
      )}

      {isScanning && (
        <div className="h-64 flex flex-col items-center justify-center gap-8 bg-black/20 rounded-2xl border border-white/5">
           <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                <motion.circle cx="48" cy="48" r="40" stroke="#22d3ee" strokeWidth="4" fill="transparent" strokeDasharray={251.2} initial={{ strokeDashoffset: 251.2 }} animate={{ strokeDashoffset: 251.2 * (1 - progress/100) }} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-cyan-400">{Math.round(progress)}%</span>
              </div>
           </div>
           <div className="text-center">
              <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] animate-pulse mb-2">NEURAL SCAN IN PROGRESS</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Processing: {fileName}</p>
           </div>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
           {/* Document Preview */}
           <div className="bg-black/40 rounded-xl p-6 border border-white/5 font-mono text-[10px] text-slate-400 leading-relaxed overflow-hidden max-h-48 relative">
              <div className="absolute top-4 right-4 text-cyan-500 font-black uppercase tracking-widest">[ FORENSIC_INGEST ]</div>
              <p className="mb-3 text-white font-bold uppercase tracking-widest">{">>"} FILE: {fileName} ({result.size})</p>
              {fileContent ? (
                <div className="whitespace-pre-wrap">{fileContent}</div>
              ) : (
                <div className="flex items-center gap-4 py-4">
                  <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-white font-bold uppercase tracking-widest">Neural segment ingested.</p>
                    <p className="text-slate-600">Binary analysis complete. No readable text vector identified.</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent" />
           </div>

           {/* Results HUD */}
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/40 rounded-2xl p-8 border border-white/5 shadow-2xl">
              <div className="lg:col-span-4 flex justify-center border-r border-white/5 pr-8">
                <AuthenticityGauge score={result.score} verdict={result.verdict} />
              </div>
              
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">NEURAL CRITERIA ANALYSIS</p>
                    <h4 className="text-xl font-black text-white tracking-tight">Forensic Accuracy Breakdown</h4>
                  </div>
                  <VerdictBadge verdict={result.verdict} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { label: 'Metadata Integrity', value: result.metadata, color: '#22d3ee' },
                     { label: 'Pixel Consistency', value: result.pixel, color: '#f59e0b' },
                     { label: 'Semantic Logic', value: result.semantic, color: '#a855f7' }
                   ].map(c => (
                     <div key={c.label} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.label}</span>
                          <span className="text-xs font-black text-white" style={{ color: c.color }}>{c.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} className="h-full rounded-full" style={{ backgroundColor: c.color }} />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural engine identified {result.gan}% probability of generative manipulation.</p>
                   <div className="flex gap-3">
                     <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4">Reset HUD</button>
                     <button className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors">Export Findings →</button>
                   </div>
                </div>
              </div>
           </div>
        </motion.div>
      )}
    </div>
  );
}

import { useRef, useEffect } from 'react';

export default function DeepfakePage() {
  const { data: scans = [], isLoading } = useDeepfakeScans(20);

  const manipulated = scans.filter(s => s.verdict === 'manipulated').length;
  const authentic = scans.filter(s => s.verdict === 'authentic').length;
  const inconclusive = scans.filter(s => s.verdict === 'inconclusive').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-forensic-cyan/10 border border-forensic-cyan/20 flex items-center justify-center">
          <Scan size={18} className="text-forensic-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Deepfake Detection</h1>
          <p className="text-xs text-slate-500 font-mono">MEDIA AUTHENTICITY & MANIPULATION ANALYSIS ENGINE</p>
        </div>
      </div>

      {/* Scan Zone */}
      <DeepfakeScanSimulation />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Manipulated', count: manipulated, color: '#ef4444', icon: XCircle },
          { label: 'Authentic', count: authentic, color: '#22d3ee', icon: CheckCircle },
          { label: 'Inconclusive', count: inconclusive, color: '#f59e0b', icon: AlertCircle },
        ].map(({ label, count, color, icon: Icon }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }}
            className="rounded-xl border p-4" style={{ background: `${color}08`, borderColor: `${color}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs font-mono font-bold" style={{ color }}>{label.toUpperCase()}</span>
            </div>
            <p className="text-3xl font-bold font-mono" style={{ color }}>
              {isLoading ? '—' : count}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Scan grid */}
      {isLoading && (
        <div className="h-48 flex items-center justify-center text-slate-600 font-mono text-sm">
          Loading scan results…
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scans.length === 0 ? (
           // Show fake results in demo mode
           [1,2,3,4,5,6].map((i) => (
             <ScanCard key={i} index={i} scan={{
               id: i,
               file_name: `Evidence_Segment_00${i}.mp4`,
               created_at: new Date(Date.now() - i * 3600000).toISOString(),
               verdict: i % 3 === 0 ? 'manipulated' : 'authentic',
               authenticity_score: i % 3 === 0 ? 12 + i * 2 : 88 + i,
               gan_artifact_score: i % 3 === 0 ? 76 : 4,
               temporal_coherence: i % 3 === 0 ? 34 : 98,
               manipulation_probability: i % 3 === 0 ? 82 : 2,
               confidence: 94
             }} />
           ))
        ) : (
          scans.map((scan, i) => <ScanCard key={scan.id} scan={scan} index={i} />)
        )}
      </div>
    </div>
  );
}
