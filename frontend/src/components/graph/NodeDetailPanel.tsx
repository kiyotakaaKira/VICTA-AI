'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { NODE_TYPES } from '@/lib/constants';
import type { NodeType } from '@/lib/constants';

interface NodeDetailPanelProps {
  node: {
    id: string;
    data: { label: string; type: string; [key: string]: unknown };
  };
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const typeConfig = NODE_TYPES[node.data.type as NodeType] || NODE_TYPES.case;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-3 left-3 z-20 w-64 bg-forensic-surface border border-forensic-border rounded-xl p-4 shadow-card"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ color: typeConfig.color, backgroundColor: `${typeConfig.color}18` }}
        >
          {node.data.type}
        </span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors"
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>
      <h3 className="text-base font-bold text-white mb-3">{node.data.label}</h3>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-500">Node ID</p>
          <p className="text-xs text-slate-300 font-mono">{node.id}</p>
        </div>
        {Object.entries(node.data)
          .filter(([k]) => !['label', 'type'].includes(k))
          .map(([key, val]) => (
            <div key={key}>
              <p className="text-xs text-slate-500 capitalize">{key.replace('_', ' ')}</p>
              <p className="text-xs text-slate-300">{String(val)}</p>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
