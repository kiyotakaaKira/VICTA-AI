export interface AnalyticsOverview {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  threatMetrics: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  evidenceProcessed: number;
  averageAIConfidence: number;
}
