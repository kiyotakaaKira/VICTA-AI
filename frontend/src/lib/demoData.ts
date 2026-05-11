/**
 * frontend/src/lib/demoData.ts
 * 
 * High-fidelity synthetic data for forensic platform simulation.
 */

import { AnalyticsOverview } from "@/types/analytics";

export const DEMO_ANALYTICS: AnalyticsOverview = {
  totalCases: 142,
  activeCases: 24,
  resolvedCases: 118,
  evidenceProcessed: 12840,
  averageAIConfidence: 94.2,
  threatMetrics: {
    critical: 4,
    high: 12,
    medium: 45,
    low: 81
  },
  processingRate: 14.2,
  storageUsage: 64.8,
  systemStatus: "active"
};

export const DEMO_TELEMETRY = Array.from({ length: 48 }).map((_, i) => ({
  time: `${12 + Math.floor(i / 2)}:${(i % 2) * 30}`,
  signals: 65 + Math.random() * 25,
  anomalies: Math.random() > 0.8 ? 30 + Math.random() * 60 : 5 + Math.random() * 15,
  baseline: 50
}));
