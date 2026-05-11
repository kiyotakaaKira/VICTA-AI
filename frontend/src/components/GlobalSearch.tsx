'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Briefcase, FileText, Lightbulb, X, BookOpen } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{cases: any[], evidence: any[], insights: any[], documents: any[], timeline: any[], hypotheses: any[]}>({ cases: [], evidence: [], insights: [], documents: [], timeline: [], hypotheses: [] });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({
        cases: [],
        evidence: [],
        insights: [],
        documents: [],
        timeline: [],
        hypotheses: [],
      });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        
        setResults({
          cases: data.cases || [],
          evidence: data.evidence || [],
          insights: data.insights || [],
          documents: data.documents || [],
          timeline: data.timeline || [],
          hypotheses: data.hypotheses || []
        });
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleNavigate = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  const hasResults = results.cases.length > 0 || results.evidence.length > 0 || results.insights.length > 0 || results.documents.length > 0 || results.timeline.length > 0 || results.hypotheses.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
            placeholder="Search cases, evidence, insights..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
          ) : (
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 && (
            <div className="p-12 text-center text-gray-500 text-sm">
              Type to search across all cases and evidence
            </div>
          )}

          {query.length >= 2 && !isSearching && !hasResults && (
            <div className="p-12 text-center text-gray-500 text-sm">
              No results for <span className="text-white font-medium">"{query}"</span>
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {results.cases.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900 sticky top-0">Cases</div>
                  {results.cases.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => handleNavigate(`/case/${c.id}`)}
                      className="w-full flex items-start px-4 py-3 hover:bg-gray-800 transition-colors text-left group"
                    >
                      <Briefcase className="w-4 h-4 text-gray-500 mt-1 mr-3 group-hover:text-cyan-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{c.title}</div>
                        <div className="text-xs text-gray-400 truncate">{c.description}</div>
                      </div>
                      <div className="ml-3 px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded">Risk: {c.risk_score}</div>
                    </button>
                  ))}
                </div>
              )}

              {results.evidence.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900 sticky top-0">Evidence</div>
                  {results.evidence.map(e => (
                    <button 
                      key={e.id} 
                      onClick={() => handleNavigate(`/case/${e.case_id}?tab=evidence`)}
                      className="w-full flex items-start px-4 py-3 hover:bg-gray-800 transition-colors text-left group"
                    >
                      <FileText className="w-4 h-4 text-gray-500 mt-1 mr-3 group-hover:text-cyan-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{e.file_name}</div>
                        <div className="text-xs text-gray-400 truncate">{e.ai_analysis || e.file_type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.insights.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900 sticky top-0">Insights</div>
                  {results.insights.map(i => (
                    <button 
                      key={i.id} 
                      onClick={() => handleNavigate(`/case/${i.case_id}?tab=insights`)}
                      className="w-full flex items-start px-4 py-3 hover:bg-gray-800 transition-colors text-left group"
                    >
                      <Lightbulb className="w-4 h-4 text-gray-500 mt-1 mr-3 group-hover:text-amber-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{i.title}</div>
                        <div className="text-xs text-gray-400 truncate">{i.content}</div>
                      </div>
                      <div className={`ml-3 px-2 py-0.5 text-xs rounded border severity-${i.severity}`}>
                        {i.severity}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.documents?.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900 sticky top-0">Documents</div>
                  {results.documents.map((d: any) => (
                    <button key={d.id} onClick={() => handleNavigate(`/case/${d.case_id}?tab=documents`)} className="w-full flex items-start px-4 py-3 hover:bg-gray-800 transition-colors text-left group">
                      <BookOpen className="w-4 h-4 text-gray-500 mt-1 mr-3 group-hover:text-cyan-400" />
                      <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{d.summary}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
