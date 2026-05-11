"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  MapPin,
  FileText,
  User,
  Phone,
  CreditCard,
  Car,
  Fingerprint,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Clock,
  Shield,
  Brain,
} from "lucide-react"

// ============================================
// Types
// ============================================
interface ForensicEvent {
  id: string
  timestamp: string
  time: string
  type: "cctv" | "document" | "location" | "communication" | "financial" | "vehicle" | "biometric" | "alert"
  title: string
  description: string
  location?: string
  aiConfidence: number
  severity: "critical" | "high" | "medium" | "low" | "info"
  details?: {
    label: string
    value: string
  }[]
  linkedEvents?: string[]
  cctvSource?: string
  thumbnailDescription?: string
}

// ============================================
// Sample Data
// ============================================
const forensicEvents: ForensicEvent[] = [
  {
    id: "EVT-001",
    timestamp: "2024-03-15T08:23:41",
    time: "08:23:41",
    type: "cctv",
    title: "Subject Entry Detected",
    description: "Primary subject identified entering facility via main entrance. Facial recognition confirmed with 94.7% match probability.",
    location: "Building A - Main Entrance",
    aiConfidence: 94.7,
    severity: "high",
    cctvSource: "CAM-A1-ENTRANCE",
    thumbnailDescription: "Figure in dark jacket entering through glass doors",
    details: [
      { label: "Camera ID", value: "CAM-A1-ENTRANCE" },
      { label: "Resolution", value: "4K Ultra HD" },
      { label: "Frame Rate", value: "60 FPS" },
    ],
    linkedEvents: ["EVT-002", "EVT-003"],
  },
  {
    id: "EVT-002",
    timestamp: "2024-03-15T08:31:15",
    time: "08:31:15",
    type: "biometric",
    title: "Access Card Authenticated",
    description: "Biometric access system triggered. Subject used employee credential ID-7842 to access restricted area.",
    location: "Building A - Server Room Access",
    aiConfidence: 99.2,
    severity: "critical",
    details: [
      { label: "Credential ID", value: "EMP-7842-ALPHA" },
      { label: "Clearance Level", value: "Level 4" },
      { label: "Access Point", value: "SR-MAIN-001" },
    ],
    linkedEvents: ["EVT-001", "EVT-004"],
  },
  {
    id: "EVT-003",
    timestamp: "2024-03-15T08:45:22",
    time: "08:45:22",
    type: "communication",
    title: "Encrypted Communication Detected",
    description: "Anomalous encrypted transmission intercepted from subject device. Signal pattern matches known exfiltration protocols.",
    location: "Building A - Floor 3",
    aiConfidence: 87.3,
    severity: "critical",
    details: [
      { label: "Protocol", value: "TLS 1.3 / Custom" },
      { label: "Duration", value: "4m 32s" },
      { label: "Data Volume", value: "847 MB" },
    ],
    linkedEvents: ["EVT-001", "EVT-005"],
  },
  {
    id: "EVT-004",
    timestamp: "2024-03-15T09:12:08",
    time: "09:12:08",
    type: "cctv",
    title: "Secondary Subject Identified",
    description: "Additional individual detected in proximity to primary subject. Running cross-reference analysis on known associates database.",
    location: "Building A - Corridor B",
    aiConfidence: 78.4,
    severity: "medium",
    cctvSource: "CAM-A3-CORRIDOR",
    thumbnailDescription: "Two figures in conversation near elevator bank",
    details: [
      { label: "Camera ID", value: "CAM-A3-CORRIDOR" },
      { label: "Association Score", value: "High" },
      { label: "Previous Encounters", value: "3 confirmed" },
    ],
    linkedEvents: ["EVT-002", "EVT-006"],
  },
  {
    id: "EVT-005",
    timestamp: "2024-03-15T09:34:55",
    time: "09:34:55",
    type: "financial",
    title: "Suspicious Transaction Flagged",
    description: "Automated monitoring detected unusual financial activity. Multiple rapid transfers to offshore accounts initiated.",
    location: "Digital - Financial Network",
    aiConfidence: 96.1,
    severity: "critical",
    details: [
      { label: "Transaction Count", value: "7 transfers" },
      { label: "Total Amount", value: "$2.4M USD" },
      { label: "Destination", value: "Multiple jurisdictions" },
    ],
    linkedEvents: ["EVT-003", "EVT-007"],
  },
  {
    id: "EVT-006",
    timestamp: "2024-03-15T10:02:33",
    time: "10:02:33",
    type: "vehicle",
    title: "Vehicle Exit Recorded",
    description: "Subject vehicle detected leaving underground parking. License plate captured and tracked via municipal ALPR network.",
    location: "Building A - Parking Level B2",
    aiConfidence: 99.8,
    severity: "high",
    cctvSource: "CAM-PARK-B2-EXIT",
    thumbnailDescription: "Black sedan exiting parking garage ramp",
    details: [
      { label: "Vehicle", value: "2023 BMW 540i" },
      { label: "License", value: "7XKF-442" },
      { label: "Direction", value: "Northbound I-95" },
    ],
    linkedEvents: ["EVT-004", "EVT-008"],
  },
  {
    id: "EVT-007",
    timestamp: "2024-03-15T10:28:17",
    time: "10:28:17",
    type: "document",
    title: "Document Access Logged",
    description: "Classified document repository accessed. Multiple files downloaded matching sensitive project keywords.",
    location: "Digital - Document Server",
    aiConfidence: 91.5,
    severity: "critical",
    details: [
      { label: "Files Accessed", value: "23 documents" },
      { label: "Classification", value: "Confidential+" },
      { label: "Download Size", value: "1.2 GB" },
    ],
    linkedEvents: ["EVT-005", "EVT-009"],
  },
  {
    id: "EVT-008",
    timestamp: "2024-03-15T11:15:44",
    time: "11:15:44",
    type: "location",
    title: "Subject Location Pinpointed",
    description: "Cell tower triangulation places subject at suspected safehouse location. Surveillance assets repositioning.",
    location: "1847 Industrial Parkway",
    aiConfidence: 82.6,
    severity: "high",
    details: [
      { label: "Confidence Radius", value: "50 meters" },
      { label: "Duration at Location", value: "47 minutes" },
      { label: "Known Associate", value: "Proximity confirmed" },
    ],
    linkedEvents: ["EVT-006"],
  },
  {
    id: "EVT-009",
    timestamp: "2024-03-15T12:03:29",
    time: "12:03:29",
    type: "alert",
    title: "Pattern Anomaly Detected",
    description: "AI correlation engine flagged behavioral deviation. Subject actions diverge 340% from established baseline patterns.",
    location: "System - AI Analysis Engine",
    aiConfidence: 97.8,
    severity: "critical",
    details: [
      { label: "Deviation Score", value: "340%" },
      { label: "Risk Assessment", value: "Elevated" },
      { label: "Recommended Action", value: "Immediate review" },
    ],
    linkedEvents: ["EVT-007", "EVT-008"],
  },
]

// ============================================
// Event Type Icons
// ============================================
const eventIcons: Record<ForensicEvent["type"], typeof Camera> = {
  cctv: Camera,
  document: FileText,
  location: MapPin,
  communication: Phone,
  financial: CreditCard,
  vehicle: Car,
  biometric: Fingerprint,
  alert: AlertTriangle,
}

// ============================================
// Severity Colors
// ============================================
const severityConfig: Record<ForensicEvent["severity"], { bg: string; border: string; text: string; glow: string }> = {
  critical: {
    bg: "bg-destructive/20",
    border: "border-destructive",
    text: "text-destructive",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  },
  high: {
    bg: "bg-warning/20",
    border: "border-warning",
    text: "text-warning",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
  },
  medium: {
    bg: "bg-primary/20",
    border: "border-primary",
    text: "text-primary",
    glow: "shadow-[0_0_20px_rgba(79,70,229,0.3)]",
  },
  low: {
    bg: "bg-secondary/20",
    border: "border-secondary",
    text: "text-secondary",
    glow: "shadow-[0_0_20px_rgba(20,184,166,0.3)]",
  },
  info: {
    bg: "bg-muted/20",
    border: "border-muted-foreground",
    text: "text-muted-foreground",
    glow: "",
  },
}

// ============================================
// AI Confidence Bar
// ============================================
function AIConfidenceBar({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 90) return "bg-secondary"
    if (confidence >= 75) return "bg-primary"
    if (confidence >= 50) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="flex items-center gap-2">
      <Brain className="w-3 h-3 text-muted-foreground" />
      <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-12 text-right">
        {confidence.toFixed(1)}%
      </span>
    </div>
  )
}

// ============================================
// CCTV Indicator
// ============================================
function CCTVIndicator({ source, isActive }: { source: string; isActive?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-background/50 border border-border/50 rounded">
      <motion.div
        className={`w-2 h-2 rounded-full ${isActive ? "bg-destructive" : "bg-muted-foreground"}`}
        animate={isActive ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <Camera className="w-3 h-3 text-muted-foreground" />
      <span className="text-xs font-mono text-muted-foreground">{source}</span>
    </div>
  )
}

// ============================================
// Event Marker
// ============================================
function EventMarker({
  event,
  isExpanded,
  isHovered,
  onClick,
  onHover,
  onLeave,
  position,
}: {
  event: ForensicEvent
  isExpanded: boolean
  isHovered: boolean
  onClick: () => void
  onHover: () => void
  onLeave: () => void
  position: number
}) {
  const Icon = eventIcons[event.type]
  const severity = severityConfig[event.severity]

  return (
    <motion.div
      className="absolute top-0 flex flex-col items-center cursor-pointer"
      style={{ left: `${position}%` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.01 }}
    >
      {/* Connector Line */}
      <motion.div
        className={`w-px h-8 ${severity.border.replace("border-", "bg-")}`}
        animate={{ height: isHovered || isExpanded ? 48 : 32 }}
        transition={{ duration: 0.2 }}
      />

      {/* Event Node */}
      <motion.div
        className={`relative p-2 rounded-full border-2 ${severity.border} ${severity.bg} backdrop-blur-sm`}
        animate={{
          scale: isHovered || isExpanded ? 1.2 : 1,
          boxShadow: isHovered || isExpanded ? severity.glow.replace("shadow-", "").replace("[", "").replace("]", "") : "none",
        }}
        whileHover={{ scale: 1.3 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className={`w-4 h-4 ${severity.text}`} />

        {/* Recording indicator for CCTV */}
        {event.type === "cctv" && (
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Timestamp */}
      <motion.div
        className="mt-2 px-2 py-1 bg-card/80 backdrop-blur-sm border border-border/50 rounded text-center"
        animate={{ opacity: isHovered || isExpanded ? 1 : 0.7 }}
      >
        <p className="text-[10px] font-mono text-muted-foreground">{event.time}</p>
      </motion.div>

      {/* Hover Preview */}
      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            className="absolute top-full mt-12 z-50 w-64"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className={`bg-card/95 backdrop-blur-md border ${severity.border} rounded-lg p-3 ${severity.glow}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded ${severity.bg} ${severity.text}`}>
                  {event.severity}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{event.id}</span>
              </div>
              <p className="text-sm font-medium mb-1">{event.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
              {event.cctvSource && (
                <div className="mt-2">
                  <CCTVIndicator source={event.cctvSource} isActive />
                </div>
              )}
              <div className="mt-2">
                <AIConfidenceBar confidence={event.aiConfidence} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// Expanded Event Card
// ============================================
function ExpandedEventCard({
  event,
  onClose,
}: {
  event: ForensicEvent
  onClose: () => void
}) {
  const Icon = eventIcons[event.type]
  const severity = severityConfig[event.severity]

  return (
    <motion.div
      className={`bg-card/95 backdrop-blur-md border ${severity.border} rounded-xl p-5 ${severity.glow}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${severity.bg} border ${severity.border}`}>
            <Icon className={`w-5 h-5 ${severity.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${severity.bg} ${severity.text}`}>
                {event.severity}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{event.id}</span>
            </div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left - Description & Details */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{event.location}</span>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-mono text-muted-foreground">{event.timestamp}</span>
          </div>

          {/* AI Confidence */}
          <div className="bg-background/50 border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">AI Confidence Score</span>
            </div>
            <AIConfidenceBar confidence={event.aiConfidence} />
          </div>
        </div>

        {/* Right - CCTV / Details */}
        <div className="space-y-4">
          {/* CCTV Preview */}
          {event.cctvSource && (
            <div className="bg-background/50 border border-border/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <CCTVIndicator source={event.cctvSource} isActive />
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="aspect-video bg-black/50 rounded-md flex items-center justify-center border border-border/30">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{event.thumbnailDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* Event Details */}
          {event.details && (
            <div className="bg-background/50 border border-border/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider">Event Intelligence</span>
              </div>
              <div className="space-y-2">
                {event.details.map((detail, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span className="font-mono">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Events */}
          {event.linkedEvents && event.linkedEvents.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Linked:</span>
              {event.linkedEvents.map((id) => (
                <span
                  key={id}
                  className="px-2 py-0.5 text-[10px] font-mono bg-primary/10 border border-primary/30 rounded text-primary"
                >
                  {id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Main Timeline Component
// ============================================
export default function ForensicTimeline() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate event positions (0-100%)
  const eventPositions = forensicEvents.map((event, index) => ({
    ...event,
    position: (index / (forensicEvents.length - 1)) * 100,
  }))

  // Playback animation
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setPlaybackPosition((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.5
        })
      }, 50)
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
  }, [isPlaying])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleReset = () => {
    setZoom(1)
    setPlaybackPosition(0)
    setIsPlaying(false)
    setExpandedEvent(null)
  }

  const currentEvent = eventPositions.find((e) => e.id === expandedEvent)

  return (
    <motion.div
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover-glow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Forensic Investigation Timeline
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              CASE-2024-0315 | {forensicEvents.length} Events Recorded
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Play className="w-4 h-4 text-primary" />
            )}
            <span className="text-xs font-medium text-primary">
              {isPlaying ? "Pause" : "Replay"}
            </span>
          </button>
          <div className="h-6 w-px bg-border" />
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs font-mono text-muted-foreground w-12 text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
            disabled={zoom >= 2}
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="h-6 w-px bg-border" />
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Timeline Area */}
      <div className="relative">
        {/* Timeline Track */}
        <div
          ref={timelineRef}
          className="relative overflow-x-auto pb-4"
          style={{ transform: `scaleX(${zoom})`, transformOrigin: "left" }}
        >
          <div className="relative h-32 min-w-full">
            {/* Background Track */}
            <div className="absolute top-8 left-0 right-0 h-px bg-border" />

            {/* Playback Progress */}
            <motion.div
              className="absolute top-8 left-0 h-px bg-primary"
              style={{ width: `${playbackPosition}%` }}
            />

            {/* Playback Head */}
            <motion.div
              className="absolute top-6 w-px h-6 bg-primary"
              style={{ left: `${playbackPosition}%` }}
              animate={{ opacity: isPlaying ? 1 : 0 }}
            >
              <motion.div
                className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Event Markers */}
            {eventPositions.map((event) => (
              <EventMarker
                key={event.id}
                event={event}
                position={event.position}
                isExpanded={expandedEvent === event.id}
                isHovered={hoveredEvent === event.id}
                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                onHover={() => setHoveredEvent(event.id)}
                onLeave={() => setHoveredEvent(null)}
              />
            ))}
          </div>
        </div>

        {/* Time Labels */}
        <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-muted-foreground">
          <span>{forensicEvents[0]?.time}</span>
          <span>{forensicEvents[Math.floor(forensicEvents.length / 2)]?.time}</span>
          <span>{forensicEvents[forensicEvents.length - 1]?.time}</span>
        </div>
      </div>

      {/* Expanded Event Detail */}
      <AnimatePresence>
        {currentEvent && (
          <motion.div className="mt-6">
            <ExpandedEventCard
              event={currentEvent}
              onClose={() => setExpandedEvent(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Severity Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/30">
        {(["critical", "high", "medium", "low", "info"] as const).map((sev) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${severityConfig[sev].border.replace("border-", "bg-")}`} />
            <span className="text-[10px] uppercase text-muted-foreground">{sev}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
