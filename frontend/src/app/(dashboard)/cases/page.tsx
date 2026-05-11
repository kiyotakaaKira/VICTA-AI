'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { RiskBar } from '@/components/ui/RiskBar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatTimeAgo, getRiskColor, getRiskLabel } from '@/lib/utils';
import { ArrowRight, Clock, User, Tag, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import type { Case } from '@/types/case';
import { useCases } from '@/hooks/useCases';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

import { CaseDetailView } from '@/components/cases/CaseDetailView';

function CaseCard({ c, index, onOpen }: { c: Case; index: number; onOpen: (id: string) => void }) {
  const riskColor = getRiskColor(c.risk_score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={() => onOpen(c.id as string)}
      className="cursor-pointer"
    >
      <GlassCard className="p-5 h-full flex flex-col gap-3 relative overflow-hidden group">
        {/* Top glow bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${riskColor}60, transparent)` }}
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={c.priority as any}>{c.priority}</Badge>
            <Badge variant={c.status as any}>{c.status}</Badge>
          </div>
          <div
            className="flex items-center gap-1 text-xs text-forensic-cyan group-hover:text-white transition-colors whitespace-nowrap"
          >
            Details <ArrowRight size={12} />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white text-base leading-snug mb-1">{c.title}</h3>
          <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 uppercase tracking-wider" style={{ fontSize: 10 }}>Risk Score</span>
            <span className="font-bold capitalize" style={{ color: riskColor }}>
              {getRiskLabel(c.risk_score)} · {c.risk_score}
            </span>
          </div>
          <RiskBar score={c.risk_score} height={5} />
        </div>

        {c.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded font-mono bg-white/4 text-slate-500 border border-white/6"
                style={{ fontSize: 10 }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-600 mt-auto pt-1 border-t border-forensic-border">
          <div className="flex items-center gap-1">
            <User size={10} />
            <span>{c.assigned_to || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{formatTimeAgo(c.updated_at)}</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function CasesPage() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  const statusParam = filter === 'all' ? undefined : filter;
  const { data: cases = [], isLoading, isError } = useCases(statusParam);

  const filtered = cases.filter((c) => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = search === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <PageWrapper>
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="data-label text-forensic-cyan/60 mb-1">INVESTIGATIONS</p>
            <h1 className="text-3xl font-black text-white">Case Registry</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isLoading ? 'Loading cases…' : `${cases.length} total cases · ${cases.filter((c) => c.status === 'active').length} active`}
              {isError ? ' · Failed to load cases' : ''}
            </p>
          </div>
          <button className="btn-cyan text-xs">+ New Case</button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="forensic-input pl-8"
            />
          </div>
          <div className="flex gap-1 p-0.5 bg-white/4 rounded-lg">
            {['all', 'active', 'pending', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                  filter === s
                    ? 'bg-forensic-cyan text-forensic-bg'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <CardSkeleton key={k} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <CaseCard key={c.id} c={c} index={i} onOpen={setSelectedCaseId} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            {isError ? 'Could not reach the case registry API.' : 'No cases match your filter.'}
          </div>
        )}

        <AnimatePresence>
          {selectedCaseId && (
            <CaseDetailView id={selectedCaseId} onClose={() => setSelectedCaseId(null)} />
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
