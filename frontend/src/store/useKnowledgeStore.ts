import { create } from 'zustand';

export interface GraphNode {
  id: string;
  label: string;
  type: 'CASE' | 'PERSON' | 'LOCATION' | 'EVIDENCE' | 'DEVICE';
  color: string;
  x: number;
  y: number;
  subLabel?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

interface CaseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  description: string;
  keyFindings: string[];
  graphType?: 'network' | 'radial' | 'tree';
}

interface KnowledgeGraphState {
  cases: Record<string, CaseGraph>;
  activeCase: string;
  setActiveCase: (caseId: string) => void;
  addNode: (node: GraphNode) => void;
  addEdge: (edge: GraphEdge) => void;
  updateNodePos: (nodeId: string, x: number, y: number) => void;
  resetGraph: () => void;
}

const SAMPLE_CASES: Record<string, CaseGraph> = {
  'crimson-fox': {
    description: 'Investigation into a high-speed vehicle pursuit involving potential ballistic discharge in sector 9.',
    keyFindings: ['GSR detected on steering wheel', '9mm shell matches sidearm'],
    nodes: [
      { id: 'c1-v1', label: 'VICTIM A', type: 'PERSON', color: '#F59E0B', x: 400, y: 300, subLabel: 'DECEASED' },
      { id: 'c1-e1', label: '9MM SHELL', type: 'EVIDENCE', color: '#10B981', x: 250, y: 200, subLabel: 'FORENSIC' },
      { id: 'c1-s1', label: 'SUSPECT X', type: 'PERSON', color: '#EF4444', x: 600, y: 250, subLabel: 'PRIMARY' },
      { id: 'c1-d1', label: 'SEDAN B2', type: 'EVIDENCE', color: '#10B981', x: 550, y: 450, subLabel: 'VEHICLE' },
      { id: 'c1-l1', label: 'SECTOR 9', type: 'LOCATION', color: '#4F46E5', x: 300, y: 500, subLabel: 'SCENE' },
      { id: 'c1-i1', label: 'CELL-09', type: 'EVIDENCE', color: '#10B981', x: 750, y: 350, subLabel: 'INTERCEPT' },
      { id: 'c1-b1', label: 'BIO-SCAN', type: 'PERSON', color: '#F59E0B', x: 150, y: 400, subLabel: 'MATCHED' },
    ],
    edges: [
      { id: 'c1-ed1', source: 'c1-v1', target: 'c1-e1' }, 
      { id: 'c1-ed2', source: 'c1-e1', target: 'c1-s1' },
      { id: 'c1-ed3', source: 'c1-s1', target: 'c1-d1' },
      { id: 'c1-ed4', source: 'c1-d1', target: 'c1-l1' },
      { id: 'c1-ed5', source: 'c1-s1', target: 'c1-i1' },
      { id: 'c1-ed6', source: 'c1-v1', target: 'c1-l1' },
      { id: 'c1-ed7', source: 'c1-b1', target: 'c1-s1' },
    ]
  },
  'phantom-hawk': {
    description: 'Cyber espionage investigation linked to Vantage Cartel operating out of Lagos.',
    keyFindings: ['Encrypted drive found at Motel 6', 'Rafael Mendes signature detected'],
    nodes: [
      { id: 'ph-n1', label: 'VANTAGE', type: 'CASE', color: '#4F46E5', x: 400, y: 100, subLabel: 'CARTEL' },
      { id: 'ph-n2', label: 'RAFAEL M.', type: 'PERSON', color: '#EF4444', x: 200, y: 300, subLabel: 'SUSPECT' },
      { id: 'ph-n3', label: 'DRIVE-01', type: 'EVIDENCE', color: '#10B981', x: 600, y: 300, subLabel: 'ENCRYPTED' },
    ],
    edges: [{ id: 'ph-e1', source: 'ph-n2', target: 'ph-n1' }, { id: 'ph-e2', source: 'ph-n3', target: 'ph-n1' }],
    graphType: 'network'
  },
  'dark-eagle': {
    description: 'Financial fraud investigation linked to Iron Wolf Group.',
    keyFindings: ['SWIFT logs show illegal routing', 'Maria Müller linked to offshore shell co.'],
    nodes: [
      { id: 'de-n1', label: 'IRON WOLF', type: 'CASE', color: '#4F46E5', x: 500, y: 100, subLabel: 'GROUP' },
      { id: 'de-n2', label: 'MARIA M.', type: 'PERSON', color: '#EF4444', x: 300, y: 300, subLabel: 'FRAUD' },
      { id: 'de-n3', label: 'SWIFT LOG', type: 'EVIDENCE', color: '#10B981', x: 700, y: 300, subLabel: 'ROUTING' },
    ],
    edges: [{ id: 'de-e1', source: 'de-n2', target: 'de-n1' }, { id: 'de-e2', source: 'de-n3', target: 'de-n1' }],
    graphType: 'tree'
  },
  'neon-falcon': {
    description: 'Dark web node intercept in Mumbai.',
    keyFindings: ['PGP key matches hacking syndicate', 'James K. linked via encrypted mail'],
    nodes: [
      { id: 'nf-n1', label: 'MUMBAI SRV', type: 'LOCATION', color: '#4F46E5', x: 500, y: 350, subLabel: 'NODE' },
      { id: 'nf-n2', label: 'JAMES K.', type: 'PERSON', color: '#EF4444', x: 300, y: 150, subLabel: 'HACKER' },
      { id: 'nf-n3', label: 'PGP KEY', type: 'EVIDENCE', color: '#10B981', x: 700, y: 150, subLabel: 'ENCRYPTED' },
      { id: 'nf-n4', label: 'PROXY-01', type: 'DEVICE', color: '#6366F1', x: 500, y: 550, subLabel: 'RELAY' },
    ],
    edges: [
      { id: 'nf-e1', source: 'nf-n2', target: 'nf-n1' }, 
      { id: 'nf-e2', source: 'nf-n3', target: 'nf-n1' },
      { id: 'nf-e3', source: 'nf-n4', target: 'nf-n1' }
    ],
    graphType: 'radial'
  },
  'shadow-dragon': {
    description: 'Shadow Nexus financial fraud in Caracas.',
    keyFindings: ['Tumbling node identified', 'Omar Garcia signature found'],
    nodes: [
      { id: 'sd-n1', label: 'NEXUS', type: 'CASE', color: '#4F46E5', x: 300, y: 100, subLabel: 'SHADOW' },
      { id: 'sd-n2', label: 'OMAR G.', type: 'PERSON', color: '#EF4444', x: 100, y: 300, subLabel: 'SUSPECT' },
      { id: 'sd-n3', label: 'TUMBLER', type: 'EVIDENCE', color: '#10B981', x: 500, y: 300, subLabel: 'CRYPTO' },
    ],
    edges: [{ id: 'sd-e1', source: 'sd-n2', target: 'sd-n1' }, { id: 'sd-e2', source: 'sd-n3', target: 'sd-n1' }]
  },
  'ghost-fox': {
    description: 'Cobalt Syndicate money laundering in New York.',
    keyFindings: ['Shell company identified in Delaware', 'Victor Rossi linked via wire'],
    nodes: [
      { id: 'gf-n1', label: 'COBALT', type: 'CASE', color: '#4F46E5', x: 400, y: 100, subLabel: 'SYNDICATE' },
      { id: 'gf-n2', label: 'VICTOR R.', type: 'PERSON', color: '#EF4444', x: 200, y: 300, subLabel: 'SUSPECT' },
      { id: 'gf-n3', label: 'SHELL CO.', type: 'EVIDENCE', color: '#10B981', x: 600, y: 300, subLabel: 'NY-LAUNDRY' },
    ],
    edges: [{ id: 'gf-e1', source: 'gf-n2', target: 'gf-n1' }, { id: 'gf-e2', source: 'gf-n3', target: 'gf-n1' }]
  }
};

export const useKnowledgeStore = create<KnowledgeGraphState>((set) => ({
  cases: SAMPLE_CASES,
  activeCase: 'crimson-fox',
  setActiveCase: (caseId) => set({ activeCase: caseId }),
  addNode: (node) => set((state) => ({
    cases: {
      ...state.cases,
      [state.activeCase]: {
        ...state.cases[state.activeCase],
        nodes: [...state.cases[state.activeCase].nodes, node]
      }
    }
  })),
  addEdge: (edge) => set((state) => ({
    cases: {
      ...state.cases,
      [state.activeCase]: {
        ...state.cases[state.activeCase],
        edges: [...state.cases[state.activeCase].edges, edge]
      }
    }
  })),
  updateNodePos: (nodeId, x, y) => set((state) => ({
    cases: {
      ...state.cases,
      [state.activeCase]: {
        ...state.cases[state.activeCase],
        nodes: state.cases[state.activeCase].nodes.map(n => 
          n.id === nodeId ? { ...n, x, y } : n
        )
      }
    }
  })),
  resetGraph: () => set({ cases: SAMPLE_CASES, activeCase: 'crimson-fox' }),
}));
