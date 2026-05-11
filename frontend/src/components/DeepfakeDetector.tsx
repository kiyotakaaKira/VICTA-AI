'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileAudio, FileVideo, FileImage, AlertTriangle, ShieldCheck, FileWarning, Search, Zap, CheckCircle, BrainCircuit } from 'lucide-react';
import { createAuthenticatedApi } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeepfakeDetector({ caseId, onScanComplete }: { caseId: string, onScanComplete: () => void }) {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const phases = [
    'Uploading & Extracting Metadata',
    'Scanning for GAN Artifacts',
    'Analyzing Pixel Anomalies',
    'Running AI Inference',
    'Generating Report'
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFile(e.target.files[0]);
  };

  const handleFile = (f: File) => {
    if (!f) return;
    setError('');
    if (f.size > 50 * 1024 * 1024) {
      setError('File exceeds 50MB limit.');
      return;
    }
    const isImage = f.type.startsWith('image/');
    const isVideo = f.type.startsWith('video/');
    const isAudio = f.type.startsWith('audio/');
    if (!isImage && !isVideo && !isAudio) {
      setError('Invalid file type. Only image, video, and audio are supported.');
      return;
    }
    setFile(f);
  };

  const startScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setResult(null);
    setError('');
    
    // Simulate initial phases
    for (let i = 0; i < 3; i++) {
      setPhase(i);
      await new Promise(r => setTimeout(r, [500, 800, 600][i]));
    }
    setPhase(3);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const api = createAuthenticatedApi(token);
      
      const fileType = file.type.split('/')[0];
      const desc = `${file.name} | type: ${file.type} | size: ${file.size} bytes | modified: ${new Date(file.lastModified).toISOString()}`;

      // Assume evidence creation is handled elsewhere or mock an ID for now
      const mockEvidenceId = 'ev-' + Date.now();

      const { data } = await api.post('/api/analyze', {
        action: 'deepfake_scan',
        description: desc,
        file_type: fileType,
        case_id: caseId,
        evidence_id: mockEvidenceId
      });

      setPhase(4);
      await new Promise(r => setTimeout(r, 400));
      
      if (data.success) {
        setResult(data.analysis);
        onScanComplete();
      } else {
        setError(data.error || 'Analysis failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during scanning.');
    } finally {
      setIsScanning(false);
      setPhase(0);
    }
  };

  const renderMeter = (score: number) => {
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#ef4444';

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="#1f2937" strokeWidth="8" fill="none" />
          <motion.circle
            className="meter-circle"
            cx="50" cy="50" r={radius}
            stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute font-mono font-bold text-lg" style={{ color }}>{score}%</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {!isScanning && !result && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
        >
          <Upload className="w-10 h-10 text-gray-500 mb-4" />
          <p className="text-gray-400 font-mono text-sm mb-2">Drag & drop media evidence here</p>
          <p className="text-gray-600 text-xs mb-4">Supports Image, Video, Audio (Max 50MB)</p>
          <input type="file" id="df-upload" className="hidden" onChange={handleChange} accept="image/*,video/*,audio/*" />
          <label htmlFor="df-upload" className="px-4 py-2 bg-gray-800 text-cyan-400 border border-cyan-500/30 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors text-sm">
            Select File
          </label>
          
          {file && (
            <div className="mt-6 p-3 bg-gray-900 border border-gray-700 rounded-lg flex items-center gap-3 w-full max-w-sm">
              {file.type.startsWith('video') ? <FileVideo className="text-cyan-400" /> : file.type.startsWith('audio') ? <FileAudio className="text-cyan-400" /> : <FileImage className="text-cyan-400" />}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-gray-300 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
          
          {file && (
            <button onClick={startScan} className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" /> Run Deepfake Scan
            </button>
          )}

          {error && <p className="mt-4 text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</p>}
        </div>
      )}

      {isScanning && (
        <div className="border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-900/50">
          <div className="relative w-full max-w-md h-2 bg-gray-800 rounded overflow-hidden mb-6">
            <div className="scan-line" />
          </div>
          <div className="space-y-3 w-full max-w-md">
            {phases.map((p, i) => (
              <div key={p} className="flex items-center justify-between text-sm font-mono">
                <span className={i === phase ? 'text-cyan-400' : i < phase ? 'text-gray-500' : 'text-gray-700'}>{p}</span>
                {i < phase && <CheckCircle className="w-4 h-4 text-cyan-500" />}
                {i === phase && <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }}><Zap className="w-4 h-4 text-cyan-400" /></motion.div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-700 bg-gray-900 rounded-xl p-5 flex items-center justify-between col-span-1 md:col-span-2 holo-card">
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Authenticity Score</p>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded severity-${result.risk_level === 'high' || result.risk_level === 'critical' ? 'critical' : result.risk_level === 'medium' ? 'medium' : 'low'}`}>
                    {result.risk_level.toUpperCase()} RISK
                  </span>
                  <span className="text-gray-500 text-sm">Confidence: {result.confidence}%</span>
                </div>
              </div>
              {renderMeter(result.authenticity_score)}
            </div>

            <div className="border border-gray-700 bg-gray-900 rounded-xl p-5 flex flex-col justify-center holo-card">
              <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">GAN Artifacts</p>
              <div className="flex items-center gap-2">
                {result.gan_artifacts_detected ? (
                  <><FileWarning className="text-red-400 w-5 h-5" /><span className="text-red-400 font-bold">DETECTED</span></>
                ) : (
                  <><ShieldCheck className="text-green-400 w-5 h-5" /><span className="text-green-400 font-bold">NOT DETECTED</span></>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-700 bg-gray-900 rounded-xl p-5">
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-cyan-400" /> AI Explanation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{result.ai_explanation}</p>
            </div>
            
            <div className="space-y-4">
              {result.metadata_anomalies?.length > 0 && (
                <div className="border border-gray-700 bg-gray-900 rounded-xl p-4">
                  <h4 className="text-gray-300 text-xs uppercase mb-2">Metadata Anomalies</h4>
                  <ul className="space-y-1">
                    {result.metadata_anomalies.map((a: string, i: number) => (
                      <li key={i} className="text-xs text-amber-400 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5" /> {a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.suspicious_regions?.length > 0 && (
                <div className="border border-gray-700 bg-gray-900 rounded-xl p-4">
                  <h4 className="text-gray-300 text-xs uppercase mb-2">Manipulation Regions</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suspicious_regions.map((r: any, i: number) => (
                      <div key={i} className={`text-xs px-2 py-1 rounded border severity-${r.severity}`}>
                        {r.region}: {r.anomaly}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {result.frame_analysis?.length > 0 && (
            <div className="border border-gray-700 bg-gray-900 rounded-xl p-5">
              <h3 className="text-white text-sm font-semibold mb-4">Temporal Frame Analysis</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.frame_analysis}>
                    <XAxis dataKey="frame" stroke="#4b5563" fontSize={10} />
                    <YAxis stroke="#4b5563" fontSize={10} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                    <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload.anomaly) return <circle cx={cx} cy={cy} r={4} fill="#ef4444" />;
                      return <circle cx={cx} cy={cy} r={2} fill="#06b6d4" />;
                    }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 text-center">
            <p className="text-amber-500/80 text-xs font-mono">
              ⚠ DISCLAIMER: AI analysis is probabilistic. All findings require verification by qualified forensic professionals before use in any legal proceeding.
            </p>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setResult(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Scan Another File</button>
          </div>
        </div>
      )}
    </div>
  );
}
