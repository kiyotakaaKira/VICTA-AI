'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CaseOverview } from './CaseOverview';
import { useEvidence } from '@/hooks/useEvidence';
import { useInsights } from '@/hooks/useInsights';
import { useTimeline } from '@/hooks/useTimeline';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'insights', label: 'AI Insights' },
];

export function CaseTabs({ caseId }: { caseId: string }) {
  const [activeTab, setActiveTab] = useState('overview');

  useEvidence(caseId);
  useInsights(caseId);
  useTimeline(caseId);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-forensic-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-forensic-cyan'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forensic-cyan rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <CaseOverview caseId={caseId} />}
      {activeTab === 'evidence' && (
        <GlassCard className="p-6 text-slate-500 text-sm text-center">
          Evidence tab — use EvidenceList component here
        </GlassCard>
      )}
      {activeTab === 'timeline' && (
        <GlassCard className="p-6 text-slate-500 text-sm text-center">
          Timeline tab — use TimelineView component here
        </GlassCard>
      )}
      {activeTab === 'insights' && (
        <GlassCard className="p-6 text-slate-500 text-sm text-center">
          AI Insights tab — use InsightsFeed component here
        </GlassCard>
      )}
    </div>
  );
}
