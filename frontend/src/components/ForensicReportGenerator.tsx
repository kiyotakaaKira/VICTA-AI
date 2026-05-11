'use client';

import { useState, useEffect } from 'react';
import { FileDown, Shield, FileText, AlertTriangle, CheckSquare, Copy, Download } from 'lucide-react';
import { createAuthenticatedApi } from '@/lib/api';
import { useAuth, useUser } from '@clerk/nextjs';
import supabase from '@/lib/supabase';

export default function ForensicReportGenerator({ caseId, caseData, evidence, insights, timeline }: any) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    const loadExisting = async () => {
      const { data } = await supabase.from('forensic_reports').select('*').eq('case_id', caseId).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        setReport(data[0].content);
      }
    };
    loadExisting();
  }, [caseId]);

  useEffect(() => {
    if (!isGenerating) return;
    const text = "AI is composing your forensic report...";
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateReport = async () => {
    setIsGenerating(true);
    setError('');
    setLoadingText('');
    
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const api = createAuthenticatedApi(token);
      
      const { data } = await api.post('/api/analyze', {
        action: 'generate_report',
        case_id: caseId,
        user_id: user?.id,
        title: caseData.title,
        description: caseData.description,
        riskScore: caseData.risk_score,
        evidence: evidence,
        insights: insights,
        timeline: timeline
      });

      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || 'Failed to generate report.');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url;
    a.download = `forensic-report-${caseId}.json`; 
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    // Optional: show copied state
  };

  if (!report && !isGenerating) {
    return (
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center flex flex-col items-center">
        <FileDown className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-white font-medium mb-2">Forensic Report Generation</h3>
        <p className="text-gray-400 text-sm mb-6 max-w-md">Compile all evidence, timeline events, and insights into a comprehensive AI-generated forensic report.</p>
        <button 
          onClick={generateReport}
          disabled={evidence?.length === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Report
        </button>
        {evidence?.length === 0 && <p className="text-xs text-amber-500 mt-3">Add evidence to the case before generating a report.</p>}
        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="border border-gray-700 rounded-xl p-16 flex flex-col items-center justify-center min-h-[400px] bg-gray-900/50">
        <FileText className="w-10 h-10 text-indigo-500 mb-6 animate-pulse" />
        <div className="font-mono text-cyan-400 text-lg h-8 cursor-blink">{loadingText}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-950 p-6 rounded-xl border border-gray-800">
      <div className="flex justify-between items-start border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{caseData.title}</h1>
            <span className="px-2 py-1 bg-red-900/40 text-red-400 border border-red-500/30 text-xs font-bold rounded">CONFIDENTIAL</span>
          </div>
          <p className="text-gray-500 text-sm font-mono">GENERATED: {new Date().toISOString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="p-2 bg-gray-800 text-gray-300 hover:text-white rounded border border-gray-700 hover:bg-gray-700 transition-colors" title="Copy JSON">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-2 bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors" title="Download JSON">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-200 mb-3 border-b border-gray-800 pb-2">Executive Summary</h2>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{report.executive_summary}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-200 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-500" /> Key Findings</h2>
            <ul className="space-y-3">
              {report.key_findings?.map((f: string, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-cyan-500 font-mono mt-0.5">{(i+1).toString().padStart(2, '0')}.</span> {f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-200 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Evidence Assessment</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{report.evidence_assessment}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-200 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Investigative Gaps</h2>
            <ul className="space-y-2">
              {report.investigative_gaps?.map((g: string, i: number) => (
                <li key={i} className="text-sm text-amber-400/80 flex items-start gap-2 bg-amber-900/10 p-2 rounded border border-amber-900/20">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {g}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-200 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-green-500" /> Recommendations</h2>
            <ul className="space-y-2">
              {report.recommendations?.map((r: string, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2 p-2 bg-gray-900 rounded border border-gray-800">
                  <div className="w-4 h-4 border border-gray-600 rounded shrink-0 mt-0.5" /> {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="md:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">
            <p className="text-xs text-gray-500 uppercase font-mono mb-1">AI Confidence</p>
            <p className="text-3xl font-bold text-cyan-400 mb-6">{report.confidence_level}%</p>
            
            <p className="text-xs text-gray-500 uppercase font-mono mb-1">Classification</p>
            <p className="text-sm font-bold text-red-400 mb-6">{report.report_classification}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
        <p className="text-xs text-amber-500/80 font-mono text-center">{report.disclaimer}</p>
      </div>
    </div>
  );
}
