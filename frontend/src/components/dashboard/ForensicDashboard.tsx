"use client"

import { useEffect, useMemo, useState } from "react"
import { useAnalyticsOverview } from "@/hooks/useAnalyticsOverview"
import { useTelemetrySeries } from "@/hooks/useTelemetrySeries"
import { useIntelligenceFeed } from "@/hooks/useIntelligenceFeed"
import { formatTimeAgo } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  Activity,
  AlertTriangle,
  Cpu,
  Eye,
  Radar,
  Database,
  Network,
  Info,
  Target,
  Zap,
  Lock,
  Radio,
  Map,
  Camera,
  Video,
  Car,
} from "lucide-react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { StatsRow } from "./StatsRow"
import { InvestigationNetwork } from "./InvestigationNetwork"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

// ============================================
// Animated Counter Component
// ============================================
function AnimatedCounter({
  value,
  duration = 2,
}: {
  value: number
  duration?: number
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value <= 0) {
      setCount(0)
      return
    }
    let start = 0
    const end = value
    const incrementTime = Math.max(16, (duration * 1000) / end)
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= end) clearInterval(timer)
    }, incrementTime)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count.toLocaleString()}</span>
}

// ============================================
// Radial Gauge Component
// ============================================
function ThreatGauge({ value, label }: { value: number; label: string }) {
  const radius = 80
  const stroke = 8
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = () => {
    if (value < 30) return "#14B8A6"
    if (value < 60) return "#F59E0B"
    return "#EF4444"
  }

  return (
    <div className="relative flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          stroke="#2A3548"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Animated progress circle */}
        <motion.circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${getColor()})` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold font-mono"
          style={{ color: getColor() }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {value}%
        </motion.span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
          {label}
        </span>
      </div>
    </div>
  )
}

// ============================================
// Status Indicator Component
// ============================================
function StatusIndicator({
  status,
  label,
}: {
  status: "online" | "warning" | "critical"
  label: string
}) {
  const colors = {
    online: "bg-secondary",
    warning: "bg-warning",
    critical: "bg-destructive",
  }

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`w-2 h-2 rounded-full ${colors[status]}`}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

// ============================================
// Metric Card Component
// ============================================
function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  trend?: "up" | "down" | "stable"
  delay?: number
}) {
  const trendColors = {
    up: "text-destructive",
    down: "text-secondary",
    stable: "text-muted-foreground",
  }

  return (
    <motion.div
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover-glow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary/10 rounded-md">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs ${trendColors[trend]}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold font-mono">
          <AnimatedCounter value={value} />
          {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </motion.div>
  )
}

// ============================================
// Telemetry Chart Component
// ============================================
function TelemetryChart() {
  const { lastMessage } = useWebSocket();
  const [data, setData] = useState<any[]>(() => {
    // Generate initial synthetic baseline
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => ({
      time: new Date(now.getTime() - (30 - i) * 2000).toLocaleTimeString(),
      signals: 40 + Math.random() * 20,
      anomalies: 10 + Math.random() * 15,
      density: 60 + Math.random() * 30
    }));
  });

  useEffect(() => {
    if (lastMessage?.type === 'TELEMETRY_TICK') {
      setData(prev => {
        const newData = [...prev, { 
          time: lastMessage.payload.timestamp, 
          signals: lastMessage.payload.signalStrength, 
          anomalies: lastMessage.payload.anomalyScore,
          density: 40 + Math.random() * 50
        }];
        return newData.slice(-30);
      });
    }
  }, [lastMessage]);

  return (
    <motion.div
      className="h-64 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <div className="absolute top-0 right-0 flex gap-4 text-[10px] font-black uppercase tracking-widest z-10">
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> SIGNAL</div>
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> DENSITY</div>
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> ANOMALY</div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#475569"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            interval={5}
          />
          <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
          
          <Area
            type="monotone"
            dataKey="density"
            stroke="#06B6D4"
            strokeWidth={1}
            fill="url(#densityGradient)"
            strokeDasharray="5 5"
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="signals"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#signalGradient)"
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="anomalies"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#anomalyGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ============================================
// Activity Feed Component
// ============================================
function ActivityFeed() {
  const { lastMessage } = useWebSocket();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (lastMessage?.type === 'INTELLIGENCE_FEED') {
      const a = lastMessage.payload;
      const newItem = {
        id: a.id,
        type: a.severity === "critical" ? "alert" : a.severity === "high" ? "warning" : "info",
        message: `${a.title}: ${a.message}`.slice(0, 120),
        time: 'Just now',
      };
      setActivities(prev => [newItem, ...prev].slice(0, 8));
    }
  }, [lastMessage]);

  if (activities.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">No intelligence feed events in the current window.</p>
    )
  }

  const typeColors = {
    alert: "border-destructive text-destructive",
    warning: "border-warning text-warning",
    info: "border-primary text-primary",
    success: "border-secondary text-secondary",
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            className={`border-l-2 ${typeColors[activity.type as keyof typeof typeColors]} pl-3 py-2`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <p className="text-sm text-foreground">{activity.message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

import { DEMO_ANALYTICS } from "@/lib/demoData"

// ============================================
// Main Dashboard Component
// ============================================
export default function ForensicDashboard() {
  const { isDemoMode } = useWebSocket()
  const { data: analytics = DEMO_ANALYTICS } = useAnalyticsOverview()
  const tm = analytics.threatMetrics

  const postureRisk = useMemo(() => {
    if (!tm) return 42 // High-fidelity default
    const raw =
      (tm.critical * 22 + tm.high * 12 + tm.medium * 5 + tm.low * 2) /
      Math.max(analytics.totalCases, 1)
    return Math.min(99, Math.max(5, Math.round(raw)))
  }, [analytics, tm])

  const activeAnomalies = tm ? tm.critical + tm.high : 0
  const investigations = analytics.activeCases
  const aiConfidence = Math.round(analytics.averageAIConfidence)
  const matrixCounts = useMemo(
    () => [
      { label: "Critical", count: tm?.critical ?? 0, color: "bg-destructive" },
      { label: "High", count: tm?.high ?? 0, color: "bg-warning" },
      { label: "Medium", count: tm?.medium ?? 0, color: "bg-primary" },
      { label: "Low", count: tm?.low ?? 0, color: "bg-secondary" },
      {
        label: "Info",
        count: analytics ? Math.max(0, analytics.evidenceProcessed % 1000) : 0,
        color: "bg-muted-foreground",
      },
      { label: "Resolved", count: analytics?.resolvedCases ?? 0, color: "bg-border" },
    ],
    [tm, analytics]
  )

  return (
    <div className="relative z-10 space-y-6 pb-20">
      {/* ============================================ */}
      {/* DEMO MODE BADGE */}
      {/* ============================================ */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between px-4 py-2 bg-warning/20 border border-warning/30 rounded-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <span className="text-xs font-bold text-warning uppercase tracking-widest">
                SIMULATION MODE ACTIVE
              </span>
              <span className="text-[10px] text-warning/70 hidden md:inline">
                | Backend connection degraded. Utilizing synthetic intelligence fallback.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* PHASE 1: PREMIUM STATS GRID */}
      {/* ============================================ */}
      <StatsRow />

      {/* ============================================ */}
      {/* PHASE 2: INVESTIGATION NETWORK & SIGNAL DRIFT */}
      {/* ============================================ */}
      <InvestigationNetwork />

      {/* ============================================ */}
      {/* PHASE 3: LEGACY THREAT POSTURE & TELEMETRY */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE - AI Threat Posture */}
        <motion.div
          className="lg:col-span-5 space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover-glow">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                AI Threat Posture Assessment
              </h2>
            </div>
            <div className="flex justify-center mb-6">
              <ThreatGauge value={postureRisk} label="Risk Level" />
            </div>
            {/* Activity Feed */}
            <ActivityFeed />
          </div>
        </motion.div>

        {/* RIGHT SIDE - Telemetry & Analytics */}
        <motion.div
          className="lg:col-span-7 space-y-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Signal Intelligence Telemetry
                </h2>
              </div>
            </div>
            <TelemetryChart />
          </div>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* NEW PHASE 4: GEOSPATIAL & ASSET INGESTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geospatial Intelligence Hub */}
        <motion.div 
          className="lg:col-span-8 bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative min-h-[500px] overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                 <Map className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Geospatial Intelligence Hub</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Real-time Mission Proximity Monitoring</p>
              </div>
            </div>
            <div className="flex gap-4">
               {['MUMBAI', 'NEW YORK', 'BERLIN'].map(city => (
                 <span key={city} className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 cursor-pointer transition-colors">{city}</span>
               ))}
            </div>
          </div>

          <div className="relative w-full h-[350px] bg-black/40 rounded-xl border border-white/5 overflow-hidden">
             {/* Simulated Map Background (Circuit Pattern) */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff05_2px,transparent_2px)] [background-size:32px_32px]" />
             
             {/* Tactical Radar Sweep */}
             <motion.div 
               className="absolute inset-0 z-0 pointer-events-none"
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(99, 102, 241, 0.05) 50%, transparent 100%)' }}
             />

             {/* Scanning Line */}
             <motion.div 
               className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/20 z-10 pointer-events-none"
               animate={{ top: ['0%', '100%', '0%'] }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             />

             {/* Connection Streams (between markers) */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <motion.path 
                  d="M 30% 40% Q 50% 30% 65% 25%" 
                  stroke="#6366F1" strokeWidth="1" fill="none" strokeDasharray="5,5"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.path 
                  d="M 65% 25% Q 75% 45% 85% 60%" 
                  stroke="#6366F1" strokeWidth="1" fill="none" strokeDasharray="5,5"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
             </svg>

             {/* Glowing Markers */}
             {[
               { x: '30%', y: '40%', label: 'NODE_ALPHA', status: 'critical' },
               { x: '65%', y: '25%', label: 'TARGET_X', status: 'online' },
               { x: '50%', y: '70%', label: 'BASE_09', status: 'warning' },
               { x: '85%', y: '60%', label: 'SIGNAL_INTERCEPT', status: 'online' }
             ].map((marker, i) => (
               <motion.div
                 key={i}
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.6 + i * 0.1 }}
                 className="absolute w-4 h-4 -ml-2 -mt-2 cursor-pointer group"
                 style={{ left: marker.x, top: marker.y }}
               >
                 <div className={`absolute inset-0 rounded-full blur-md animate-pulse ${
                   marker.status === 'critical' ? 'bg-red-500' : marker.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                 }`} />
                 <div className={`relative w-full h-full rounded-full border-2 border-white/20 ${
                   marker.status === 'critical' ? 'bg-red-600' : marker.status === 'warning' ? 'bg-amber-600' : 'bg-indigo-600'
                 }`} />
                 <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#0f172a] border border-white/10 px-2 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest z-50 shadow-2xl">
                    {marker.label} // {marker.status}
                 </div>
               </motion.div>
             ))}

             <div className="absolute bottom-4 left-4 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl z-20">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tactical Overlay</p>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[8px] text-slate-400 font-bold uppercase">Critical</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[8px] text-slate-400 font-bold uppercase">Warning</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[8px] text-slate-400 font-bold uppercase">Active</span></div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Neural Asset Ingestion Grid */}
        <motion.div 
          className="lg:col-span-4 bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Global Neural Scan Line */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent z-20 pointer-events-none"
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <div className="mb-6">
            <h3 className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-1">Asset Pipeline</h3>
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-white tracking-tight">Neural Ingestion Grid</h2>
               <span className="text-[8px] font-black text-indigo-500 animate-pulse">PROCESSING...</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 relative">
            {[
              { id: '1', type: 'CCTV-ALPHA', icon: Camera, confidence: 98, date: '14:02', color: '#6366F1' },
              { id: '2', type: 'REAR-CAM-4', icon: Video, confidence: 94, date: '13:45', color: '#06B6D4' },
              { id: '3', type: 'SURV-NODE-9', icon: Eye, confidence: 99, date: '13:12', color: '#10B981' },
              { id: '4', type: 'DASH-CAM-02', icon: Car, confidence: 87, date: '12:55', color: '#EF4444' },
              { id: '5', type: 'CCTV-BETA', icon: Camera, confidence: 96, date: '12:30', color: '#6366F1' },
              { id: '6', type: 'TRAFFIC-HUB', icon: Radio, confidence: 91, date: '12:15', color: '#06B6D4' }
            ].map((asset, i) => {
              const Icon = asset.icon;
              return (
                <div key={i} className="aspect-square rounded-xl bg-white/[0.02] border border-white/5 p-3 flex flex-col justify-between group hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden relative">
                   {/* Card Level Scanning Effect */}
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-1.5">
                        <Icon size={10} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{asset.type}</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: asset.color }} />
                   </div>
                   <div className="relative z-10">
                      <p className="text-lg font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">{asset.confidence}%</p>
                      <p className="text-[8px] text-slate-500 font-mono">HASH: 0x{Math.random().toString(16).slice(2, 8)}</p>
                   </div>
                   <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              );
            })}
          </div>

          <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] transition-all mt-6 group overflow-hidden relative">
             <span className="relative z-10">VIEW ALL ASSETS →</span>
             <motion.div 
               className="absolute inset-0 bg-indigo-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
             />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
