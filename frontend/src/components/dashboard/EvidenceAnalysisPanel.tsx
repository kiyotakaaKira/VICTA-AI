"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useKnowledgeStore } from "@/store/useKnowledgeStore"
import {
  Upload,
  FileImage,
  FileVideo,
  FileText,
  File,
  Shield,
  Brain,
  Clock,
  MapPin,
  User,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Fingerprint,
  Eye,
  Hash,
  Calendar,
  HardDrive,
  Scan,
  Sparkles,
  Zap,
  Lock,
  FileSearch,
} from "lucide-react"

// Types
interface EvidenceFile {
  id: string
  name: string
  type: "image" | "video" | "document" | "other"
  size: string
  uploadedAt: Date
  status: "scanning" | "analyzing" | "complete" | "flagged"
  authenticity: number
  aiConfidence: number
  anomalies: string[]
  metadata: {
    created: string
    modified: string
    location?: string
    device?: string
    dimensions?: string
    duration?: string
    author?: string
    hash: string
  }
  aiSummary?: string
  category: string
  previewUrl?: string
  forensicValues?: {
    label: string
    value: number
    status: 'pass' | 'fail' | 'warning'
  }[]
}

// Mock data
const mockEvidence: EvidenceFile[] = [
  {
    id: "ev-001",
    name: "surveillance_cam_04.mp4",
    type: "video",
    size: "245 MB",
    uploadedAt: new Date(),
    status: "complete",
    authenticity: 98.5,
    aiConfidence: 96.2,
    anomalies: [],
    metadata: {
      created: "2024-03-15 14:32:18",
      modified: "2024-03-15 14:32:18",
      location: "Building A, Floor 3",
      device: "Axis P3245-V",
      duration: "00:45:32",
      hash: "a3f8d2e1c9b7...",
    },
    aiSummary: "Continuous footage showing corridor activity. Two individuals identified at 14:35:42. No signs of tampering detected.",
    category: "CCTV Footage",
  },
  {
    id: "ev-002",
    name: "document_scan_001.pdf",
    type: "document",
    size: "2.4 MB",
    uploadedAt: new Date(),
    status: "flagged",
    authenticity: 67.3,
    aiConfidence: 89.1,
    anomalies: ["Metadata inconsistency", "Modified timestamp detected"],
    metadata: {
      created: "2024-03-10 09:15:00",
      modified: "2024-03-14 22:45:33",
      author: "Unknown",
      hash: "e7c4b9a2f1d6...",
    },
    aiSummary: "Financial document with potential alterations. Page 3 shows compression artifacts suggesting post-edit modification.",
    category: "Financial Records",
  },
  {
    id: "ev-003",
    name: "crime_scene_photo_12.jpg",
    type: "image",
    size: "8.7 MB",
    uploadedAt: new Date(),
    status: "analyzing",
    authenticity: 0,
    aiConfidence: 0,
    anomalies: [],
    metadata: {
      created: "2024-03-16 08:22:45",
      modified: "2024-03-16 08:22:45",
      location: "37.7749° N, 122.4194° W",
      device: "Canon EOS R5",
      dimensions: "8192 x 5464",
      hash: "b2d9e7a4c1f8...",
    },
    category: "Crime Scene Photos",
  },
]

const categories = [
  "All Evidence",
  "CCTV Footage",
  "Crime Scene Photos",
  "Financial Records",
  "Digital Forensics",
  "Witness Statements",
]

// File Type Icon
function FileTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "image":
      return <FileImage className={className} />
    case "video":
      return <FileVideo className={className} />
    case "document":
      return <FileText className={className} />
    default:
      return <File className={className} />
  }
}

// Status Badge
function StatusBadge({ status }: { status: EvidenceFile["status"] }) {
  const config = {
    scanning: { icon: Loader2, color: "text-primary", bg: "bg-primary/20", label: "Scanning", animate: true },
    analyzing: { icon: Brain, color: "text-secondary", bg: "bg-secondary/20", label: "Analyzing", animate: true },
    complete: { icon: CheckCircle, color: "text-secondary", bg: "bg-secondary/20", label: "Verified", animate: false },
    flagged: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/20", label: "Flagged", animate: false },
  }

  const { icon: Icon, color, bg, label, animate } = config[status]

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg}`}>
      <Icon className={`w-4 h-4 ${color} ${animate ? "animate-spin" : ""}`} />
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  )
}

// Authenticity Gauge
function AuthenticityGauge({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = () => {
    if (value >= 90) return "#14B8A6"
    if (value >= 70) return "#F59E0B"
    return "#EF4444"
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">{value.toFixed(0)}%</span>
        <span className="text-[10px] text-muted-foreground">Auth</span>
      </div>
    </div>
  )
}

// Scan Animation Overlay
function ScanOverlay({ isScanning }: { isScanning: boolean }) {
  if (!isScanning) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
    >
      <div className="text-center">
        {/* Scanning Animation */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            style={{
              borderTopColor: "#4F46E5",
              borderRightColor: "#14B8A6",
            }}
          />

          {/* Middle Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-2 border-secondary/30"
            style={{
              borderTopColor: "#14B8A6",
            }}
          />

          {/* Inner Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 rounded-full border-2 border-primary/50"
            style={{
              borderTopColor: "#4F46E5",
            }}
          />

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Scan className="w-8 h-8 text-primary" />
            </motion.div>
          </div>

          {/* Pulse Effect */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/20"
          />
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          Analyzing forensic evidence...
        </motion.p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {["Scanning", "Extracting", "Validating", "Analyzing"].map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.5, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: index * 0.5, duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <span className="text-xs text-muted-foreground">{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Evidence Card
function EvidenceCard({
  evidence,
  isExpanded,
  onToggle,
}: {
  evidence: EvidenceFile
  isExpanded: boolean
  onToggle: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <motion.div
        animate={{
          boxShadow: isHovered
            ? evidence.status === "flagged"
              ? "0 20px 40px -12px rgba(239,68,68,0.3)"
              : "0 20px 40px -12px rgba(79,70,229,0.3)"
            : "0 4px 20px -4px rgba(0,0,0,0.3)",
        }}
        className={`relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border rounded-2xl overflow-hidden transition-colors ${
          evidence.status === "flagged" ? "border-destructive/30" : "border-border/30"
        }`}
      >
        {/* Main Content Info Row */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                evidence.type === "video"
                  ? "bg-primary/20"
                  : evidence.type === "image"
                  ? "bg-secondary/20"
                  : evidence.type === "document"
                  ? "bg-warning/20"
                  : "bg-muted"
              }`}
            >
              <FileTypeIcon
                type={evidence.type}
                className={`w-7 h-7 ${
                  evidence.type === "video"
                    ? "text-primary"
                    : evidence.type === "image"
                    ? "text-secondary"
                    : evidence.type === "document"
                    ? "text-warning"
                    : "text-muted-foreground"
                }`}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-sm font-semibold text-foreground truncate">{evidence.name}</h4>
                <StatusBadge status={evidence.status} />
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {evidence.size}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {evidence.uploadedAt.toLocaleDateString()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs">
                  {evidence.category}
                </span>
              </div>
            </div>

            {/* Authenticity Gauge */}
            {evidence.status === "complete" || evidence.status === "flagged" ? (
              <AuthenticityGauge value={evidence.authenticity} />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            )}

            {/* Expand Button */}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Preview & Analysis Section (Always visible for newly uploaded) */}
        <AnimatePresence>
          {(isExpanded || evidence.id.startsWith('ev-new-')) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-5 pb-5 pt-2 border-t border-white/5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* File Preview */}
                <div className="lg:col-span-7 bg-black/40 rounded-xl border border-white/5 overflow-hidden relative aspect-video flex items-center justify-center group/preview">
                  {evidence.previewUrl ? (
                    evidence.type === 'video' ? (
                      <video src={evidence.previewUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={evidence.previewUrl} alt="Evidence" className="w-full h-full object-contain" />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                      <Eye className="w-12 h-12 opacity-20" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Preview Unavailable</span>
                    </div>
                  )}
                  {/* Overlay Scanner effect */}
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-x-0 h-px bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10 pointer-events-none"
                  />
                </div>

                {/* Tactical Metrics Grid */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Forensic Analysis</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {evidence.forensicValues?.map((stat, i) => (
                      <motion.div 
                        key={stat.label}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.value}%` }}
                                className={`h-full ${stat.status === 'pass' ? 'bg-cyan-500' : stat.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                              />
                            </div>
                            <span className="text-xs font-mono text-slate-200">{stat.value}%</span>
                          </div>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${stat.status === 'pass' ? 'text-cyan-400' : stat.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                          {stat.status}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-border/30"
            >
              <div className="p-5 space-y-5">
                {/* AI Summary */}
                {evidence.aiSummary && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                      <Sparkles className="w-4 h-4" />
                      AI-Generated Summary
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {evidence.aiSummary}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Brain className="w-3 h-3" />
                      Confidence: {evidence.aiConfidence}%
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-muted-foreground" />
                    Forensic Metadata
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MetadataItem icon={Calendar} label="Created" value={evidence.metadata.created} />
                    <MetadataItem icon={Clock} label="Modified" value={evidence.metadata.modified} />
                    {evidence.metadata.location && (
                      <MetadataItem icon={MapPin} label="Location" value={evidence.metadata.location} />
                    )}
                    {evidence.metadata.device && (
                      <MetadataItem icon={Camera} label="Device" value={evidence.metadata.device} />
                    )}
                    {evidence.metadata.dimensions && (
                      <MetadataItem icon={Eye} label="Dimensions" value={evidence.metadata.dimensions} />
                    )}
                    {evidence.metadata.duration && (
                      <MetadataItem icon={Clock} label="Duration" value={evidence.metadata.duration} />
                    )}
                    {evidence.metadata.author && (
                      <MetadataItem icon={User} label="Author" value={evidence.metadata.author} />
                    )}
                    <MetadataItem icon={Hash} label="Hash" value={evidence.metadata.hash} />
                  </div>
                </div>

                {/* Confidence Indicators */}
                <div className="flex items-center gap-6">
                  <ConfidenceBar label="Authenticity" value={evidence.authenticity} />
                  <ConfidenceBar label="AI Confidence" value={evidence.aiConfidence} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// Metadata Item
function MetadataItem({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  )
}

// Confidence Bar
function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const getColor = () => {
    if (value >= 90) return "#14B8A6"
    if (value >= 70) return "#F59E0B"
    return "#EF4444"
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: getColor() }}
        />
      </div>
    </div>
  )
}

// Drop Zone
function DropZone({
  isDragging,
  onDrop,
}: {
  isDragging: boolean
  onDrop: (files: FileList) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer.files) {
        onDrop(e.dataTransfer.files)
      }
    },
    [onDrop]
  )

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      animate={{
        borderColor: isDragging ? "#4F46E5" : "rgba(42,53,72,0.5)",
        backgroundColor: isDragging ? "rgba(79,70,229,0.1)" : "transparent",
      }}
      className="relative border-2 border-dashed rounded-2xl p-8 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onDrop(e.target.files)}
      />

      <div className="text-center">
        <motion.div
          animate={{
            y: isDragging ? -10 : 0,
            scale: isDragging ? 1.1 : 1,
          }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Upload className="w-8 h-8 text-primary" />
        </motion.div>

        <h4 className="text-lg font-semibold text-foreground mb-2">
          {isDragging ? "Drop evidence files here" : "Upload Evidence Files"}
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop files or click to browse
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Encrypted Transfer
          </span>
          <span className="flex items-center gap-1">
            <Fingerprint className="w-3 h-3" />
            Chain of Custody
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Tamper Detection
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Main Component
export default function EvidenceAnalysisPanel() {
  const [evidence, setEvidence] = useState<EvidenceFile[]>(mockEvidence)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [activeCategory, setActiveCategory] = useState("All Evidence")
  const { addNode, addEdge } = useKnowledgeStore()

  const handleDrop = useCallback((files: FileList) => {
    setIsScanning(true)

    // Simulate scanning process
    setTimeout(() => {
      const newEvidence: EvidenceFile[] = Array.from(files).map((file, index) => {
        const isVideo = file.type.startsWith("video/")
        const isImage = file.type.startsWith("image/")
        
        return {
          id: `ev-new-${Date.now()}-${index}`,
          name: file.name,
          type: isImage ? "image" : isVideo ? "video" : file.type.includes("pdf") ? "document" : "other",
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedAt: new Date(),
          status: "complete",
          authenticity: 85 + Math.random() * 15,
          aiConfidence: 80 + Math.random() * 20,
          anomalies: [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            hash: Math.random().toString(36).substring(2, 15) + "...",
          },
          aiSummary: "Forensic analysis successful. Object detected and verified against tactical database.",
          category: "Uploaded Evidence",
          previewUrl: URL.createObjectURL(file),
          forensicValues: [
            { label: 'Neural Frame Consistency', value: 92 + Math.random() * 8, status: 'pass' },
            { label: 'Metadata Hash Validation', value: 100, status: 'pass' },
            { label: 'Compression Artifact Scan', value: 88 + Math.random() * 10, status: 'pass' },
            { label: 'Global Lighting Vector', value: 95 + Math.random() * 5, status: 'pass' },
          ]
        }
      })

      setEvidence((prev) => [...newEvidence, ...prev])
      
      // Update Knowledge Graph
      newEvidence.forEach((ev, idx) => {
        const nodeId = `node-${ev.id}`
        addNode({
          id: nodeId,
          label: ev.name.split('.')[0].toUpperCase(),
          type: 'EVIDENCE',
          color: '#10B981',
          x: 70 + Math.random() * 20,
          y: 20 + Math.random() * 60,
          subLabel: 'NEW'
        })
        addEdge({
          id: `edge-${nodeId}`,
          source: 'v1', // Link to central victim for now
          target: nodeId
        })
      })

      setIsScanning(false)
    }, 3000)
  }, [addNode, addEdge])

  const filteredEvidence =
    activeCategory === "All Evidence"
      ? evidence
      : evidence.filter((e) => e.category === activeCategory)

  return (
    <section className="relative space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Evidence Analysis</h2>
            <p className="text-sm text-muted-foreground">Forensic evidence processing and validation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{evidence.length} files</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="text-secondary flex items-center gap-1">
            <Zap className="w-3 h-3" />
            AI Active
          </span>
        </div>
      </motion.div>

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6 overflow-hidden"
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {/* Scan Overlay */}
        <ScanOverlay isScanning={isScanning} />

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-primary/20 text-primary font-medium"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Drop Zone */}
        <DropZone isDragging={isDragging} onDrop={handleDrop} />

        {/* Evidence List */}
        <div className="mt-6 space-y-4">
          <AnimatePresence>
            {filteredEvidence.map((item) => (
              <EvidenceCard
                key={item.id}
                evidence={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredEvidence.length === 0 && (
          <div className="text-center py-12">
            <FileSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No evidence files in this category</p>
          </div>
        )}
      </motion.div>
    </section>
  )
}
