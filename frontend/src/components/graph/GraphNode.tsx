'use client';

import { Handle, Position, type NodeProps } from 'reactflow';
import { NODE_TYPES } from '@/lib/constants';
import type { NodeType } from '@/lib/constants';

export function GraphNode({ data }: NodeProps) {
  const typeConfig = NODE_TYPES[data.type as NodeType] || NODE_TYPES.case;

  return (
    <div
      className="px-4 py-2.5 rounded-xl min-w-[120px] text-center relative"
      style={{
        background: `${typeConfig.color}15`,
        border: `1.5px solid ${typeConfig.color}60`,
        boxShadow: `0 0 16px ${typeConfig.color}25`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ borderColor: typeConfig.color }} />
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: typeConfig.color }}
      >
        {data.type}
      </p>
      <p className="text-sm text-white font-medium leading-snug">{data.label}</p>
      <Handle type="source" position={Position.Bottom} style={{ borderColor: typeConfig.color }} />
    </div>
  );
}
