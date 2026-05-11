"use client"

import { useState, useEffect, useMemo } from "react"
import { useAnalyticsOverview } from "@/hooks/useAnalyticsOverview"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video,
  Image,
  FileText,
  Folder,
  Shield,
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  TrendingUp,
  MoreVertical,
  ChevronDown,
  Zap,
  Target,
  Cpu,
  Database,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data
const riskCategories = [
  { id: "total", label: "Total Threats", value: 132, icon: Shield, color: "#EF4444" },
  { id: "video", label: "Video File Risk", value: 16, icon: Video, color: "#4F46E5" },
  { id: "image", label: "Image File Risk", value: 43, icon: Image, color: "#14B8A6" },
  { id: "docs", label: "Docs File Risk", value: 7, icon: FileText, color: "#F59E0B" },
  { id: "folder", label: "Folder File Risk", value: 66, icon: Folder, color: "#8B5CF6" },
]

const threatSummaryData = [
  { month: "Jan", threats: 120 },
  { month: "Feb", threats: 180 },
  { month: "Mar", threats: 150 },
  { month: "Apr", threats: 220 },
  { month: "May", threats: 280 },
  { month: "Jun", threats: 290 },
  { month: "Jul", threats: 320 },
  { month: "Aug", threats: 280 },
  { month: "Sep", threats: 340 },
  { month: "Oct", threats: 380 },
  { month: "Nov", threats: 420 },
  { month: "Dec", threats: 380 },
]

const virusData = [
  { name: "ILOVEYOU", value: 35, color: "#4F46E5" },
  { name: "Melissa", value: 25, color: "#14B8A6" },
  { name: "MyDoom", value: 22, color: "#F59E0B" },
  { name: "Sasser", value: 18, color: "#EF4444" },
]

const aiMetrics = [
  { label: "Detection Accuracy", value: 98.7, trend: "+2.3%", icon: Target },
  { label: "Processing Speed", value: 1.2, unit: "ms", trend: "-15%", icon: Zap },
  { label: "Model Confidence", value: 94.5, trend: "+1.8%", icon: Brain },
  { label: "Data Throughput", value: 847, unit: "GB/s", trend: "+12%", icon: Database },
]

const investigationStats = [
  { label: "Active Cases", value: 47, max: 100, color: "#4F46E5" },
  { label: "Resolved Today", value: 23, max: 50, color: "#14B8A6" },
  { label: "Pending Review", value: 12, max: 30, color: "#F59E0B" },
  { label: "Critical Alerts", value: 8, max: 20, color: "#EF4444" },
]

// Animated Counter
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const incrementTime = (duration * 1000) / end
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= end) clearInterval(timer)
    }, incrementTime)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count}</span>
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-2xl"
      >
        <p className="text-xs text-muted-foreground mb-1">{label} 2024</p>
        <p className="text-lg font-semibold text-foreground">
          Threats: <span className="text-primary">{payload[0].value}</span>
        </p>
      </motion.div>
    )
  }
  return null
}

// Risk Category Card
function RiskCard({ item, index }: { item: typeof riskCategories[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        animate={{
          y: isHovered ? -4 : 0,
          boxShadow: isHovered
            ? `0 20px 40px -12px ${item.color}30`
            : "0 4px 20px -4px rgba(0,0,0,0.3)",
        }}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-5 overflow-hidden"
      >
        {/* Background Glow */}
        <motion.div
          animate={{ opacity: isHovered ? 0.15 : 0.05 }}
          className="absolute inset-0 rounded-2xl"
          style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}, transparent 70%)` }}
        />

        {/* More Button */}
        <button className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: item.color }} />
        </div>

        {/* Value */}
        <div className="relative">
          <motion.span
            className="text-4xl font-bold tracking-tight text-foreground"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatedCounter value={item.value} />
            <span className="text-2xl">%</span>
          </motion.span>
        </div>

        {/* Label */}
        <p className="text-sm text-muted-foreground mt-2">{item.label}</p>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(item.value, 100)}%` }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
            className="h-full rounded-full"
            style={{ backgroundColor: item.color }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Radial Gauge
function RiskScoreGauge() {
  const score = 741
  const maxScore = 1000
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 80

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Risk Score</h3>
        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Gauge */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          {/* Progress Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</span>
          <motion.span
            className="text-5xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatedCounter value={score} duration={2} />
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning"
          >
            High
          </motion.span>
        </div>
      </div>

      {/* Scale */}
      <div className="flex justify-between mt-4 text-sm text-muted-foreground">
        <span>0</span>
        <span>1000</span>
      </div>
    </motion.div>
  )
}

// Virus Distribution Chart
function VirusDistribution() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const total = virusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Threats By Virus</h3>
        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={virusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {virusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    style={{
                      filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color})` : "none",
                      transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "center",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-foreground">
              {total}<span className="text-lg">%</span>
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {virusData.map((virus, index) => (
            <motion.div
              key={virus.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: virus.color }}
              />
              <span className="text-sm text-muted-foreground">{virus.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Threat Summary Chart
function ThreatSummaryChart() {
  const [period, setPeriod] = useState("Yearly")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6 overflow-hidden col-span-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Threat Summary</h3>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-foreground">
          {period}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={threatSummaryData}>
            <defs>
              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="threats"
              stroke="#4F46E5"
              strokeWidth={2}
              fill="url(#threatGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#4F46E5",
                stroke: "#0A0F1C",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

// AI Metrics Cards
function AIMetricsGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-2 gap-4"
    >
      {aiMetrics.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.trend.startsWith("+")

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(79,70,229,0.3)" }}
            className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-xl p-4 overflow-hidden group"
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isPositive ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
                }`}
              >
                {metric.trend}
              </span>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-foreground">
              <AnimatedCounter value={Math.floor(metric.value)} />
              {metric.value % 1 !== 0 && `.${Math.round((metric.value % 1) * 10)}`}
              {metric.unit && <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>}
            </div>

            {/* Label */}
            <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// Investigation Progress
function InvestigationProgress() {
  const { data: a } = useAnalyticsOverview()
  const stats = useMemo(() => {
    if (!a) return investigationStats
    const cap = Math.max(a.totalCases, 1)
    return [
      { label: "Active Cases", value: a.activeCases, max: cap, color: "#4F46E5" },
      { label: "Resolved", value: a.resolvedCases, max: cap, color: "#14B8A6" },
      {
        label: "Pending Review",
        value: Math.max(0, a.totalCases - a.activeCases - a.resolvedCases),
        max: cap,
        color: "#F59E0B",
      },
      { label: "Critical Alerts", value: a.threatMetrics.critical, max: 20, color: "#EF4444" },
    ]
  }, [a])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Investigation Status</h3>
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Clock className="w-4 h-4" />
          <span>Live</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-secondary"
          />
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-5">
        {stats.map((stat, index) => (
          <div key={stat.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-medium text-foreground">
                {stat.value}/{stat.max}
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (stat.max > 0 ? stat.value / stat.max : 0) * 100)}%`,
                }}
                transition={{ delay: 0.8 + index * 0.15, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: stat.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Main Component
export default function ThreatAnalyticsGrid() {
  const { data: a } = useAnalyticsOverview()
  const riskCategoryItems = useMemo(() => {
    if (!a) return riskCategories
    const total =
      a.threatMetrics.critical +
      a.threatMetrics.high +
      a.threatMetrics.medium +
      a.threatMetrics.low
    return riskCategories.map((c, i) => (i === 0 ? { ...c, value: total } : c))
  }, [a])

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Threat Analytics</h2>
            <p className="text-sm text-muted-foreground">Real-time intelligence overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-foreground">
            Daily
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium">
            Weekly
          </button>
        </div>
      </motion.div>

      {/* Current Risk Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {riskCategoryItems.map((item, index) => (
          <RiskCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <RiskScoreGauge />
          <VirusDistribution />
        </div>

        {/* Right Column - Wider */}
        <div className="lg:col-span-2 space-y-6">
          <ThreatSummaryChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIMetricsGrid />
            <InvestigationProgress />
          </div>
        </div>
      </div>
    </section>
  )
}
