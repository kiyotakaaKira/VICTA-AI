/**
 * frontend/src/lib/demoRealtimeEngine.ts
 * 
 * EMERGENCY DEMO ENGINE
 * Generates high-fidelity synthetic forensic intelligence for UI presentation.
 * Ensures the platform looks fully operational even with a disconnected backend.
 */

export interface DemoTelemetry {
  timestamp: string;
  signalStrength: number;
  anomalyScore: number;
  packetFlow: number;
  sector: string;
  status: 'active' | 'degraded' | 'critical';
}

export interface DemoIntelEvent {
  id: string;
  type: string;
  category: 'signals' | 'surveillance' | 'financial' | 'biometric' | 'behavioral' | 'cyber' | 'forensic' | 'network';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: string;
}

const INTEL_TEMPLATES: Omit<DemoIntelEvent, 'id' | 'confidence' | 'timestamp'>[] = [
  { type: 'DEEPFAKE', category: 'forensic', title: 'Deepfake Signature Detected', message: 'GAN artifact spike in video stream node-8x.', severity: 'critical' },
  { type: 'SIGINT', category: 'signals', title: 'Encrypted Comms Intercept', message: 'Unknown protocol handshake detected in sector-4.', severity: 'high' },
  { type: 'GEO', category: 'surveillance', title: 'Geofence Breach', message: 'Subject alpha-7 re-entered restricted maritime zone.', severity: 'high' },
  { type: 'BIO', category: 'biometric', title: 'Toxicology Hit', message: 'Sample S-93 matches trace ethylene glycol profile.', severity: 'critical' },
  { type: 'BEHAVIORAL', category: 'behavioral', title: 'Pattern Deviation', message: 'Subject movement contradicts established baseline.', severity: 'medium' },
  { type: 'NETWORK', category: 'network', title: 'Perimeter Probe', message: 'Sequential port scan detected from non-indexed IP.', severity: 'high' },
  { type: 'CV', category: 'surveillance', title: 'Face Match 96%', message: 'Subject identified as high-value target near portal.', severity: 'high' },
];

const RAW_LOG_TEMPLATES = [
  { tag: 'SYS', msg: 'channel IX-04 secured · TLS 1.3', color: 'text-slate-400' },
  { tag: 'AI', msg: 'anomaly cluster Δ-01 elevated entropy 3.4σ', color: 'text-cyan-400' },
  { tag: 'GEO', msg: 'vehicle AX-2271 crossing geofence 4F-09', color: 'text-emerald-400' },
  { tag: 'SIG', msg: 'encrypted burst 412 pkt/min · src B7-A1', color: 'text-amber-400' },
  { tag: 'BIO', msg: 'sample S-93 toxicology hit · ethylene glycol', color: 'text-red-400' },
  { tag: 'CV', msg: 'face match 96% · subject Alpha', color: 'text-indigo-400' },
];

export class DemoRealtimeEngine {
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private globalListeners: ((data: any) => void)[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime = Date.now();

  constructor() {
    this.start();
  }

  private start() {
    this.intervalId = setInterval(() => {
      this.tick();
    }, 2000);
  }

  private tick() {
    const telemetry = this.generateTelemetry();
    this.broadcast('TELEMETRY_TICK', telemetry);

    // Generate terminal log every tick
    const log = this.generateRawLog();
    this.broadcast('RAW_LOG_TICK', log);

    if (Math.random() > 0.7) {
      const event = this.generateIntelEvent();
      this.broadcast('INTELLIGENCE_FEED', event);
    }
  }

  private generateRawLog() {
    const tpl = RAW_LOG_TEMPLATES[Math.floor(Math.random() * RAW_LOG_TEMPLATES.length)];
    return {
      id: `log-${Math.random()}`,
      timestamp: `+[00:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}]`,
      ...tpl
    };
  }

  private generateTelemetry(): DemoTelemetry {
    return {
      timestamp: new Date().toLocaleTimeString(),
      signalStrength: 65 + Math.random() * 25,
      anomalyScore: Math.random() > 0.9 ? 85 + Math.random() * 15 : 5 + Math.random() * 20,
      packetFlow: 120 + Math.random() * 800,
      sector: `SEC-0${Math.floor(Math.random() * 9) + 1}`,
      status: Math.random() > 0.95 ? 'critical' : Math.random() > 0.8 ? 'degraded' : 'active'
    };
  }

  private generateIntelEvent(): DemoIntelEvent {
    const tpl = INTEL_TEMPLATES[Math.floor(Math.random() * INTEL_TEMPLATES.length)];
    return {
      id: `ev-${Math.random().toString(36).substr(2, 9)}`,
      ...tpl,
      confidence: 75 + Math.random() * 23,
      timestamp: new Date().toLocaleTimeString(),
    } as DemoIntelEvent;
  }

  public on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)?.push(callback);
  }

  public off(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) return;
    const filtered = this.listeners.get(type)?.filter(l => l !== callback) || [];
    this.listeners.set(type, filtered);
  }

  public subscribe(callback: (data: any) => void) {
    this.globalListeners.push(callback);
    return () => {
      this.globalListeners = this.globalListeners.filter(l => l !== callback);
    };
  }

  private broadcast(type: string, payload: any) {
    this.listeners.get(type)?.forEach(l => l(payload));
    this.globalListeners.forEach(l => l({ type, payload, demo: true }));
  }

  public getUptime() {
    const diff = Math.floor((Date.now() - this.startTime) / 1000);
    const hrs = Math.floor(diff / 3600).toString().padStart(2, '0');
    const mins = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const secs = (diff % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }
}

/** SSR-safe stub — no timers on the server (avoids Next.js RSC / flight weirdness). */
const serverStub: Pick<DemoRealtimeEngine, 'subscribe' | 'on' | 'off' | 'getUptime'> = {
  subscribe: () => () => {},
  on: () => {},
  off: () => {},
  getUptime: () => '00:00:00',
};

let browserEngine: DemoRealtimeEngine | null = null;

function resolveEngine(): DemoRealtimeEngine | typeof serverStub {
  if (typeof window === 'undefined') return serverStub;
  if (!browserEngine) browserEngine = new DemoRealtimeEngine();
  return browserEngine;
}

/**
 * Lazy demo bus — only starts intervals in the browser.
 * Use `demoEngine` everywhere; Proxy forwards to the real engine after hydration.
 */
export const demoEngine = new Proxy({} as DemoRealtimeEngine, {
  get(_target, prop) {
    const engine = resolveEngine() as Record<string | symbol, unknown>;
    const value = engine[prop as string];
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(engine);
    }
    return value;
  },
});
