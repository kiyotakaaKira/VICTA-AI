'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionLineType, 
  Handle, 
  Position, 
  Edge, 
  Node as FlowNode,
  BaseEdge,
  getBezierPath,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Shield, Target, Activity, FileSearch, Minus, Plus } from 'lucide-react';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';

// --- Custom Components ---

const SentinelNode = ({ data }: any) => {
  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="relative group">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 blur-xl rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <div 
          className="relative w-14 h-14 rounded-full border-2 flex items-center justify-center bg-[#0f172a] group-hover:border-white transition-colors"
          style={{ borderColor: `${data.color}80`, boxShadow: `0 0 15px ${data.color}40` }}
        >
          <span className="text-[10px] font-bold text-white uppercase">{data.type.substring(0, 2)}</span>
        </div>
      </div>
      <div className="mt-2 text-center bg-[#0a0f1c]/90 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 min-w-[100px]">
        <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider leading-none">{data.label}</p>
        {data.subLabel && <p className="text-[8px] text-cyan-400 font-mono mt-1 uppercase tracking-widest">{data.subLabel}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const SentinelEdge = (props: EdgeProps) => {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props;
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          stroke: 'rgba(6, 182, 212, 0.3)', 
          strokeWidth: 2, 
          strokeDasharray: '10,5'
        }} 
      />
    </>
  );
};

const nodeTypes = {
  sentinel: SentinelNode,
};

const edgeTypes = {
  sentinel: SentinelEdge,
};

// --- Main Component ---

export function KnowledgeGraph() {
  const { cases, activeCase, setActiveCase } = useKnowledgeStore();
  const currentCase = cases[activeCase];
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const onNodeClick = useCallback((event: any, node: any) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  }, []);

  // Convert Store Data to React Flow Format
  const flowNodes: FlowNode[] = useMemo(() => {
    if (!currentCase) return [];
    return currentCase.nodes.map(node => ({
      id: node.id,
      type: 'sentinel',
      position: { x: node.x, y: node.y },
      data: { 
        label: node.label, 
        type: node.type, 
        color: node.color, 
        subLabel: node.subLabel 
      },
      dragHandle: '.relative',
    }));
  }, [currentCase?.nodes]);

  const flowEdges: Edge[] = useMemo(() => {
    if (!currentCase) return [];
    return currentCase.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'sentinel',
      animated: true,
    }));
  }, [currentCase?.edges]);

  return (
    <div className="relative w-full h-full flex flex-col lg:flex-row gap-4 bg-[#020817]">
      {/* Main Graph Area */}
      <div className="flex-1 bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-0 relative overflow-hidden group min-h-[650px] flex flex-col">
        
        {/* Case Selector HUD */}
        <div className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center gap-3 p-6 bg-gradient-to-b from-[#0A0F1C] to-transparent">
          <div className="flex items-center gap-2 mr-4">
            <Shield className="w-5 h-5 text-cyan-500" />
            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Intelligence Matrix</span>
          </div>
          {Object.keys(cases).map(caseId => (
            <button
              key={caseId}
              onClick={() => {
                setActiveCase(caseId);
                setSelectedNode(null);
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${
                activeCase === caseId 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'
              }`}
            >
              {caseId}
            </button>
          ))}
          
          <div className="ml-auto hidden xl:flex items-center gap-6 pr-4">
            {[
              { label: 'PERSON', color: '#F59E0B' },
              { label: 'LOC', color: '#EF4444' },
              { label: 'EVIDENCE', color: '#10B981' },
              { label: 'DEVICE', color: '#4F46E5' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 min-h-0 relative z-10">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            fitView
            connectionLineType={ConnectionLineType.Bezier}
            proOptions={{ hideAttribution: true }}
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#1e293b" gap={25} size={1} />
            <Controls showInteractive={false} className="bg-slate-900 border-white/10 !left-6 !bottom-6" />
          </ReactFlow>
        </div>

        {/* Info Toggle Button */}
        <div className="absolute bottom-6 right-6 z-30">
          <button 
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
              isPanelOpen 
              ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
              : 'bg-[#0f172a] border-white/10 text-slate-400 hover:text-cyan-400'
            }`}
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Case Details Panel */}
      <AnimatePresence mode="wait">
        {isPanelOpen && (
          <motion.div
            key={selectedNode ? selectedNode.id : 'case-panel'}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-full lg:w-80 bg-[#0A0F1C]/90 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-6 h-full shadow-2xl overflow-y-auto custom-scrollbar"
          >
            {selectedNode ? (
              <>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedNode.data.color}20` }}>
                      <Activity className="w-5 h-5" style={{ color: selectedNode.data.color }} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{selectedNode.data.type} Profile</h3>
                      <h4 className="text-lg font-bold text-white tracking-tight">{selectedNode.data.label}</h4>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500">
                    <Info size={14} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Entity Status</p>
                    <p className="text-sm font-bold text-cyan-400">{selectedNode.data.subLabel || 'IDENTIFIED'}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <FileSearch className="w-3 h-3" />
                      Tactical Intelligence
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                      "Real-time neural analysis indicates a 94% probability link between this entity and the Project Chimera network. Cross-border activity logged in Sector-09."
                    </p>
                  </div>

                  <button className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest transition-all">
                    Full Profile Analysis
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Intelligence</h3>
                    <h4 className="text-lg font-bold text-white tracking-tight">{activeCase}</h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Mission Profile
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {currentCase?.description || 'Synchronizing intelligence baseline...'}
                    </p>
                  </div>
    
                  <div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <FileSearch className="w-3 h-3" />
                      Key Forensic Findings
                    </p>
                    <div className="space-y-3">
                      {currentCase?.keyFindings?.map((finding, i) => (
                        <div key={i} className="flex gap-3 items-start group">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                          <p className="text-[11px] text-slate-300 font-medium leading-snug">{finding}</p>
                        </div>
                      )) || (
                        <p className="text-[10px] text-slate-600 italic">No secondary findings ingested.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
 
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="bg-cyan-500/5 rounded-xl p-4 border border-cyan-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Node Density</span>
                  <span className="text-[10px] font-mono text-cyan-500">{currentCase?.nodes?.length || 0} UNITS</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentCase?.nodes?.length || 0) / 10) * 100}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
